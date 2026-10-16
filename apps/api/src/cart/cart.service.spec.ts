import { ConflictException } from '@nestjs/common';
import type { Product } from '@gg/shared';
import type { PrismaService } from '../prisma/prisma.service.js';
import { CartService } from './cart.service.js';

const mouse: Product = {
  id: 10,
  name: 'Mouse',
  slug: 'mouse',
  description: 'A mouse',
  priceCents: 2500,
  imageUrl: 'https://example.com/mouse.jpg',
  stock: 4,
  category: { name: 'Mice', slug: 'mice' },
};

const pad: Product = { ...mouse, id: 11, name: 'Pad', slug: 'pad', priceCents: 1000, stock: 3 };

function service(options: { product?: Product | null; items?: unknown[] } = {}) {
  const upsert = vi.fn(async (args: { create: { quantity: number } }) => ({
    id: 3,
    quantity: args.create.quantity,
  }));
  const prisma = {
    client: {
      orm: {
        public: {
          Cart: {
            where: () => ({ first: async () => ({ id: 7, userId: 1 }) }),
          },
          CartItem: {
            where: () => ({
              include: () => ({ all: async () => options.items ?? [] }),
            }),
            upsert,
          },
          Product: {
            where: () => ({
              include: () => ({
                first: async () => (options.product === undefined ? mouse : options.product),
              }),
            }),
          },
        },
      },
    },
  };
  return { cart: new CartService(prisma as unknown as PrismaService), upsert };
}

describe('CartService stock and price', () => {
  it('sums line totals into the subtotal', async () => {
    const { cart } = service({
      items: [
        { id: 1, quantity: 2, product: mouse },
        { id: 2, quantity: 1, product: pad },
      ],
    });

    const result = await cart.getCartWithItems(1);

    expect(result.items.map((item) => item.lineTotalCents)).toEqual([5000, 1000]);
    expect(result.subtotalCents).toBe(6000);
  });

  it('rejects a quantity above the stock that was read', async () => {
    const { cart, upsert } = service();

    await expect(cart.addItem(1, { productId: mouse.id, quantity: 5 })).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(upsert).not.toHaveBeenCalled();
  });
});
