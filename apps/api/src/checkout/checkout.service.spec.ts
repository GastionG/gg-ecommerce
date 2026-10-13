import { ConflictException } from '@nestjs/common';
import { adjustStock } from './checkout.service.js';

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
