'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatPrice, type Order } from '@gg/shared';
import { ApiError, getOrder } from '@/lib/api';

function formatWhen(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export function OrderDetail({ id }: { id: number }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  const invalid = !Number.isInteger(id) || id < 1;

  useEffect(() => {
    if (invalid) return;
    getOrder(id).then(setOrder, (err: unknown) => {
      setError(err instanceof ApiError ? err.message : 'Could not load this order.');
    });
  }, [id, invalid]);

  if (invalid) {
    return (
      <p className="text-sm text-red-600" role="alert">
        Order not found
      </p>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-red-600" role="alert">
        {error}
      </p>
    );
  }

  if (!order) {
    return <div className="h-24 animate-pulse rounded-2xl bg-zinc-200/70" />;
  }

  return (
    <div className="mx-auto w-full max-w-xl">
      <Link href="/account" className="text-sm text-zinc-500 hover:text-zinc-900">
        Back to account
      </Link>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">Order #{order.id}</h1>
      <p className="mt-2 text-sm text-zinc-600">
        {order.status} · {formatWhen(order.createdAt)}
      </p>
      <ul className="mt-8 divide-y divide-zinc-200 rounded-2xl border border-zinc-200 bg-white">
        {order.items.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-4 px-5 py-4">
            <span>
              {item.name}{' '}
              <span className="text-zinc-500">
                × {item.quantity} at {formatPrice(item.priceCents)}
              </span>
            </span>
            <span className="font-medium tabular-nums">{formatPrice(item.lineTotalCents)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-right text-xl font-semibold tabular-nums">
        {formatPrice(order.totalCents)}
      </p>
    </div>
  );
}
