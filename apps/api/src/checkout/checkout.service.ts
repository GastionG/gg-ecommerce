import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import Stripe from 'stripe';
import type { CheckoutSession } from '@gg/shared';
import { CartService } from '../cart/cart.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

type Tx = Parameters<Parameters<PrismaService['client']['transaction']>[0]>[0];

// Stripe's minimum is 30 minutes; reserved stock comes back when the session expires.
const SESSION_TTL_SECONDS = 30 * 60;

export async function adjustStock(tx: Tx, productId: number, delta: number) {
  const product = await tx.orm.public.Product.where({ id: productId }).first();
  if (!product) {
    throw new NotFoundException(`Product not found: ${productId}`);
  }

  const stock = product.stock + delta;
  if (stock < 0) {
    throw new ConflictException(
      `Only ${product.stock} left in stock for ${product.name}`,
    );
  }

  // Compare-and-swap: matches no row if another transaction changed stock since the read.
  const updated = await tx.orm.public.Product
    .where({ id: productId, stock: product.stock })
    .update({ stock });

  if (!updated) {
    throw new ConflictException(
      `Stock for ${product.name} just changed, please try again`,
    );
  }
}

@Injectable()
export class CheckoutService {
  private readonly logger = new Logger(CheckoutService.name);
  private stripeClient?: Stripe;

  constructor(
    private readonly prisma: PrismaService,
    private readonly cart: CartService,
  ) { }

  private get stripe(): Stripe {
    if (!this.stripeClient) {
      const key = process.env.STRIPE_SECRET_KEY;
      if (!key) {
        throw new Error('STRIPE_SECRET_KEY is not set');
      }
      this.stripeClient = new Stripe(key);
    }
    return this.stripeClient;
  }

  async createSession(userId: number, email: string): Promise<CheckoutSession> {
    const cart = await this.cart.getCartWithItems(userId);
    if (cart.items.length === 0) {
      throw new BadRequestException('Your cart is empty');
    }

    const order = await this.prisma.client.transaction(async (tx) => {
      for (const item of cart.items) {
        await adjustStock(tx, item.product.id, -item.quantity);
      }

      const created = await tx.orm.public.Order.create({
        userId,
        totalCents: cart.subtotalCents,
      });

      for (const item of cart.items) {
        await tx.orm.public.OrderItem.create({
          orderId: created.id,
          productId: item.product.id,
          name: item.product.name,
          priceCents: item.product.priceCents,
          quantity: item.quantity,
        });
      }

      return created;
    });

    const webOrigin = process.env.WEB_ORIGIN ?? 'http://localhost:3000';

    try {
      const session = await this.stripe.checkout.sessions.create({
        mode: 'payment',
        client_reference_id: String(order.id),
        customer_email: email,
        expires_at: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
        line_items: cart.items.map((item) => ({
          quantity: item.quantity,
          price_data: {
            currency: 'usd',
            unit_amount: item.product.priceCents,
            product_data: {
              name: item.product.name,
              images: [item.product.imageUrl],
            },
          },
        })),
        success_url: `${webOrigin}/checkout/success`,
        cancel_url: `${webOrigin}/checkout/cancel`,
      });

      if (!session.url) {
        throw new Error(`Stripe session ${session.id} has no URL`);
      }

      await this.prisma.client.orm.public.Order
        .where({ id: order.id })
        .update({ stripeSessionId: session.id });

      return { url: session.url };
    } catch (error) {
      await this.failOrder(order.id);
      throw error;
    }
  }

  constructEvent(rawBody: Buffer | undefined, signature: string | undefined) {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not set');
    }
    if (!rawBody || !signature) {
      throw new BadRequestException('Missing Stripe signature');
    }

    try {
      return this.stripe.webhooks.constructEvent(rawBody, signature, secret);
    } catch {
      throw new BadRequestException('Invalid Stripe signature');
    }
  }

  async handleEvent(event: Stripe.Event) {
    switch (event.type) {
      case 'checkout.session.completed':
        return this.markPaid(event.data.object);
      case 'checkout.session.expired':
        return this.failOrder(Number(event.data.object.client_reference_id));
    }
  }

  private async markPaid(session: Stripe.Checkout.Session) {
    if (session.payment_status !== 'paid') {
      return;
    }

    const orderId = Number(session.client_reference_id);

    await this.prisma.client.transaction(async (tx) => {
      const order = await tx.orm.public.Order
        .where({ id: orderId, status: 'PENDING' })
        .update({ status: 'PAID', stripeSessionId: session.id });

      if (!order) {
        const existing = await tx.orm.public.Order.where({ id: orderId }).first();
        if (existing?.status !== 'PAID') {
          // Paid at Stripe but the order already failed and released its stock: refund by hand.
          this.logger.error(
            `Session ${session.id} paid for order ${orderId} in status ${existing?.status ?? 'missing'}`,
          );
        }
        return;
      }

      const cart = await tx.orm.public.Cart.where({ userId: order.userId }).first();
      if (cart) {
        await tx.orm.public.CartItem.where({ cartId: cart.id }).deleteAndCount();
      }
    });
  }

  private async failOrder(orderId: number) {
    await this.prisma.client.transaction(async (tx) => {
      const order = await tx.orm.public.Order
        .where({ id: orderId, status: 'PENDING' })
        .update({ status: 'FAILED' });

      if (!order) {
        return;
      }

      const items = await tx.orm.public.OrderItem.where({ orderId }).all();
      for (const item of items) {
        await adjustStock(tx, item.productId, item.quantity);
      }
    });
  }
}
