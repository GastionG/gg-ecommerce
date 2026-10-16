import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { Cart, CartItem, Product } from '@gg/shared';
import { AddCartItemDto } from './dto/add-cart-item.dto.js';
import { UpdateCartItemDto } from './dto/update-cart-item.dto.js';

type CartItemRow = { id: number; quantity: number; product: Product | null };

const toCartItem = (row: CartItemRow): CartItem => {
  if (!row.product) {
    // Unreachable: cartItem.productId is NOT NULL with an enforced foreign key.
    // An included relation is typed nullable regardless, so narrow it here once.
    throw new Error(`Cart item ${row.id} has no product`);
  }

  return {
    id: row.id,
    quantity: row.quantity,
    lineTotalCents: row.quantity * row.product.priceCents,
    product: row.product,
  };
};

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) { }

  async getCartWithItems(userId: number): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId);

    const rows = await this.prisma.client.orm.public.CartItem
      .where({ cartId: cart.id })
      .include('product', (product) => product.include('category'))
      .all();

    const items = rows.map(toCartItem);

    return {
      id: cart.id,
      items,
      subtotalCents: items.reduce((sum, item) => sum + item.lineTotalCents, 0),
    };
  }

  private async getOrCreateCart(userId: number) {
    const row = await this.prisma.client.orm.public.Cart
      .where({ userId })
      .first();

    if (!row) {
      return await this.prisma.client.orm.public.Cart
        .create({
          userId,
        })
    }

    return row;
  }

  // ponytail: stock is read, not reserved, so a concurrent order can still
  // oversell. Checkout has to re-check it inside a transaction.
  private assertStock(product: { name: string; stock: number }, quantity: number) {
    if (quantity > product.stock) {
      throw new ConflictException(
        `Only ${product.stock} left in stock for ${product.name}`,
      );
    }
  }

  async addItem(userId: number, dto: AddCartItemDto): Promise<CartItem> {
    const cart = await this.getOrCreateCart(userId);

    const product = await this.prisma.client.orm.public.Product
      .where({ id: dto.productId })
      .include('category')
      .first();

    if (!product) {
      throw new NotFoundException(`Product not found: ${dto.productId}`);
    }

    this.assertStock(product, dto.quantity);

    try {
      const item = await this.prisma.client.orm.public.CartItem.upsert({
        create: {
          cartId: cart.id,
          productId: dto.productId,
          quantity: dto.quantity,
        },
        update: {
          quantity: dto.quantity,
        },
        conflictOn: {
          cartId: cart.id,
          productId: dto.productId,
        },
      });

      return toCartItem({ ...item, product });
    } catch (error) {
      // Postgres foreign_key_violation: the product was deleted between the
      // lookup above and this insert.
      if ((error as { sqlState?: string }).sqlState === '23503') {
        throw new NotFoundException(`Product not found: ${dto.productId}`);
      }

      throw error;
    }
  }

  async updateItem(userId: number, itemId: number, dto: UpdateCartItemDto): Promise<CartItem> {
    const cart = await this.getOrCreateCart(userId);

    const item = await this.prisma.client.orm.public.CartItem
      .where({ id: itemId, cartId: cart.id })
      .include('product', (product) => product.include('category'))
      .first();

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    const current = toCartItem(item);

    this.assertStock(current.product, dto.quantity);

    const updated = await this.prisma.client.orm.public.CartItem
      .where({ id: item.id })
      .update({
        quantity: dto.quantity,
      });

    if (!updated) {
      throw new NotFoundException('Item not found');
    }

    return toCartItem({ ...updated, product: current.product });
  }

  async removeItem(userId: number, itemId: number): Promise<void> {
    const cart = await this.getOrCreateCart(userId);

    const deleted = await this.prisma.client.orm.public.CartItem
      .where({ id: itemId, cartId: cart.id })
      .delete();

    if (!deleted) {
      throw new NotFoundException('Item not found');
    }
  }
}
