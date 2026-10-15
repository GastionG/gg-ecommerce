import { toOrder } from './orders.service.js';

const order = {
  id: 1,
  status: 'PAID' as const,
  totalCents: 15999,
  createdAt: '2026-10-09T21:00:00.000Z',
};

describe('toOrder', () => {
  it('keeps only this order’s items and snapshots the line total', () => {
    const mapped = toOrder(order, [
      { id: 10, orderId: 1, name: 'Apex Pro TKL', priceCents: 15999, quantity: 1 },
      { id: 11, orderId: 2, name: 'Other', priceCents: 100, quantity: 3 },
    ]);

    expect(mapped.items).toEqual([
      {
        id: 10,
        name: 'Apex Pro TKL',
        priceCents: 15999,
        quantity: 1,
        lineTotalCents: 15999,
      },
    ]);
    expect(mapped.totalCents).toBe(15999);
  });
});
