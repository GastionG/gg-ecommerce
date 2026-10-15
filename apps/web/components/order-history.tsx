'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatPrice, type Order } from '@gg/shared';
import { EmptyState } from '@/components/empty-state';
import { ApiError, getOrders } from '@/lib/api';

function formatWhen(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export function OrderHistory() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getOrders().then(setOrders, (err: unknown) => {
      setError(err instanceof ApiError ? err.message : 'Could not load your orders.');
    });
  }, []);

  return (
    <section className="mx-auto mt-12 w-full max-w-xl">
      <h2 className="text-xl font-semibold tracking-tight">Orders</h2>
      {error ? (
        <p className="mt-3 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      {!orders && !error ? (
        <div className="mt-4 h-24 animate-pulse rounded-2xl bg-zinc-200/70" />
      ) : null}
      {orders && orders.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            title="No orders yet"
            description="When you check out, the order shows up here."
          />
        </div>
      ) : null}
      {orders && orders.length > 0 ? (
        <ul className="mt-4 flex flex-col gap-4">
          {orders.map((order) => (
            <li key={order.id} className="rounded-2xl border border-zinc-200 bg-white px-5 py-4">
              <div className="flex items-baseline justify-between gap-4">
                <Link
                  href={`/account/orders/${order.id}`}
                  className="font-medium text-zinc-900 hover:underline"
                >
                  Order #{order.id}
                </Link>
                <span className="text-sm font-medium text-zinc-600">{order.status}</span>
              </div>
              <p className="mt-1 text-sm text-zinc-500">{formatWhen(order.createdAt)}</p>
              <ul className="mt-3 flex flex-col gap-1 text-sm text-zinc-700">
                {order.items.map((item) => (
                  <li key={item.id} className="flex justify-between gap-4">
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <span className="tabular-nums">{formatPrice(item.lineTotalCents)}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-right font-semibold tabular-nums">
                {formatPrice(order.totalCents)}
              </p>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
