import { ConflictException } from '@nestjs/common';
import type { Cart } from '@gg/shared';
import type { CartService } from '../cart/cart.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import { adjustStock, CheckoutService } from './checkout.service.js';

const sessionCreate = vi.hoisted(() => vi.fn());

vi.mock('stripe', () => ({
  default: class Stripe {
    checkout = { sessions: { create: sessionCreate } };
  },
}));

function fakeTx(stock: number, casMatches = true) {
  const update = vi.fn(async (data: { stock: number }) => (casMatches ? { stock: data.stock } : null));
  const where = vi.fn((filter: Record<string, number>) => ({
    first: async () => ({ id: filter.id, name: 'Mouse', stock }),
    update,
  }));
  const tx = { orm: { public: { Product: { where } } } };
  return { tx: tx as unknown as Parameters<typeof adjustStock>[0], where, update };
}

describe('adjustStock', () => {
  it('writes the new stock only if it is still the value that was read', async () => {
    const { tx, where, update } = fakeTx(5);
    await adjustStock(tx, 1, -2);
    expect(where).toHaveBeenLastCalledWith({ id: 1, stock: 5 });
    expect(update).toHaveBeenCalledWith({ stock: 3 });
  });

  it('rejects taking more than is in stock', async () => {
    const { tx, update } = fakeTx(1);
    await expect(adjustStock(tx, 1, -2)).rejects.toBeInstanceOf(ConflictException);
    expect(update).not.toHaveBeenCalled();
  });

  it('rejects when a concurrent change makes the compare-and-swap miss', async () => {
    const { tx } = fakeTx(5, false);
    await expect(adjustStock(tx, 1, -2)).rejects.toBeInstanceOf(ConflictException);
  });
});

describe('createSession prices', () => {
  const cart: Cart = {
    id: 1,
    subtotalCents: 6000,
    items: [
      {
        id: 1,
        quantity: 2,
        lineTotalCents: 5000,
        product: {
          id: 10,
          name: 'Mouse',
          slug: 'mouse',
          description: 'A mouse',
          priceCents: 2500,
          imageUrl: 'https://example.com/mouse.jpg',
          stock: 4,
          category: { name: 'Mice', slug: 'mice' },
        },
      },
      {
        id: 2,
        quantity: 1,
        lineTotalCents: 1000,
        product: {
          id: 11,
          name: 'Pad',
          slug: 'pad',
          description: 'A pad',
          priceCents: 1000,
          imageUrl: 'https://example.com/pad.jpg',
          stock: 3,
          category: { name: 'Mice', slug: 'mice' },
        },
      },
    ],
  };

  it('charges the cart subtotal and snapshots each item price', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_price';
    sessionCreate.mockResolvedValue({ id: 'cs_test', url: 'https://checkout.stripe.com/c/pay' });
    const orderCreate = vi.fn(async (data: { userId: number; totalCents: number }) => ({
      id: 42,
      ...data,
    }));
    const itemCreate = vi.fn(async (data: unknown) => data);
    const tx = {
      orm: {
        public: {
          Product: {
            where: () => ({
              first: async () => ({ id: 10, name: 'Mouse', stock: 5 }),
              update: async () => ({ stock: 3 }),
            }),
          },
          Order: { create: orderCreate },
          OrderItem: { create: itemCreate },
        },
      },
    };
    const prisma = {
      client: {
        transaction: async (run: (tx: typeof tx) => Promise<unknown>) => run(tx),
        orm: { public: { Order: { where: () => ({ update: async () => ({}) }) } } },
      },
    };
    const carts = { getCartWithItems: async () => cart };
    const checkout = new CheckoutService(
      prisma as unknown as PrismaService,
      carts as unknown as CartService,
    );

    const session = await checkout.createSession(1, 'buyer@gg.local');

    expect(orderCreate).toHaveBeenCalledWith({ userId: 1, totalCents: 6000 });
    expect(itemCreate).toHaveBeenCalledWith(
      expect.objectContaining({ productId: 10, priceCents: 2500, quantity: 2 }),
    );
    expect(itemCreate).toHaveBeenCalledWith(
      expect.objectContaining({ productId: 11, priceCents: 1000, quantity: 1 }),
    );
    expect(sessionCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        line_items: [
          expect.objectContaining({
            quantity: 2,
            price_data: expect.objectContaining({ unit_amount: 2500 }),
          }),
          expect.objectContaining({
            quantity: 1,
            price_data: expect.objectContaining({ unit_amount: 1000 }),
          }),
        ],
      }),
    );
    expect(session).toEqual({ url: 'https://checkout.stripe.com/c/pay' });
  });
});
