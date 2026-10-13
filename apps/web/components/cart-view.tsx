'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatPrice, type Cart } from '@gg/shared';
import { EmptyState } from '@/components/empty-state';
import { ProductImage } from '@/components/product-image';
import {
  ApiError,
  getCart,
  removeCartItem,
  startCheckout,
  updateCartItem,
} from '@/lib/api';

export function CartView() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);

  function load() {
    return getCart().then(setCart, () =>
      setError('Could not load your cart. Try again.'),
    );
  }

  useEffect(() => {
    void load();
  }, []);

  async function mutate(itemId: number, action: () => Promise<unknown>) {
    setError(null);
    setPendingId(itemId);
    try {
      await action();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not update your cart. Try again.');
    } finally {
      await load();
      setPendingId(null);
    }
  }

  async function checkout() {
    setError(null);
    setCheckingOut(true);
    try {
      const { url } = await startCheckout();
      window.location.assign(url);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not start checkout. Try again.');
      setCheckingOut(false);
      await load();
    }
  }

  if (!cart) {
    return error ? (
      <p className="text-sm text-red-600" role="alert">
        {error}
      </p>
    ) : (
      <div className="h-24 animate-pulse rounded-2xl bg-zinc-200/70" />
    );
  }

  if (cart.items.length === 0) {
    return (
      <EmptyState
        title="Your cart is empty"
        description="Browse the catalog and add some gear."
        action={
          <Link
            href="/products"
            className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Go to catalog
          </Link>
        }
      />
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <h1 className="text-3xl font-semibold tracking-tight">Cart</h1>
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      <ul className="divide-y divide-zinc-200 rounded-2xl border border-zinc-200 bg-white">
        {cart.items.map((item) => {
          const busy = pendingId === item.id;
          return (
            <li key={item.id} className="flex items-center gap-4 px-5 py-4">
              <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-zinc-100">
                <ProductImage src={item.product.imageUrl} alt={item.product.name} />
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/products/${item.product.slug}`}
                  className="font-medium text-zinc-900 hover:underline"
                >
                  {item.product.name}
                </Link>
                <p className="text-sm text-zinc-500">
                  {formatPrice(item.product.priceCents)} each
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label={`Decrease quantity of ${item.product.name}`}
                  disabled={busy || item.quantity <= 1}
                  onClick={() =>
                    void mutate(item.id, () =>
                      updateCartItem(item.id, { quantity: item.quantity - 1 }),
                    )
                  }
                  className="h-8 w-8 rounded-full border border-zinc-300 text-zinc-700 hover:bg-zinc-100 disabled:opacity-40"
                >
                  −
                </button>
                <span className="w-6 text-center tabular-nums" aria-live="polite">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  aria-label={`Increase quantity of ${item.product.name}`}
                  disabled={busy || item.quantity >= item.product.stock}
                  onClick={() =>
                    void mutate(item.id, () =>
                      updateCartItem(item.id, { quantity: item.quantity + 1 }),
                    )
                  }
                  className="h-8 w-8 rounded-full border border-zinc-300 text-zinc-700 hover:bg-zinc-100 disabled:opacity-40"
                >
                  +
                </button>
              </div>
              <p className="w-20 text-right font-semibold tabular-nums">
                {formatPrice(item.lineTotalCents)}
              </p>
              <button
                type="button"
                disabled={busy}
                onClick={() => void mutate(item.id, () => removeCartItem(item.id))}
                className="text-sm text-zinc-500 hover:text-red-600 disabled:opacity-40"
              >
                Remove
              </button>
            </li>
          );
        })}
      </ul>
      <div className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white px-5 py-4">
        <span className="text-zinc-600">Subtotal</span>
        <span className="text-xl font-semibold tabular-nums">
          {formatPrice(cart.subtotalCents)}
        </span>
      </div>
      <button
        type="button"
        onClick={() => void checkout()}
        disabled={checkingOut || pendingId !== null}
        className="self-end rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
      >
        {checkingOut ? 'Redirecting to Stripe…' : 'Checkout'}
      </button>
    </div>
  );
}
