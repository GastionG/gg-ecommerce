'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Product } from '@gg/shared';
import { useAuth } from '@/components/auth-provider';
import { ApiError, addToCart } from '@/lib/api';

type AddToCartButtonProps = {
  product: Pick<Product, 'id' | 'slug' | 'stock'>;
};

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const { user, loading } = useAuth();
  const [pending, setPending] = useState(false);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (loading) {
    return <div className="mt-8 h-11 w-40 animate-pulse rounded-full bg-zinc-200" />;
  }

  if (!user) {
    const next = encodeURIComponent(`/products/${product.slug}`);
    return (
      <Link
        href={`/login?next=${next}`}
        className="mt-8 self-start rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
      >
        Log in to add to cart
      </Link>
    );
  }

  async function handleAdd() {
    setError(null);
    setAdded(false);
    setPending(true);
    try {
      await addToCart({ productId: product.id, quantity: 1 });
      setAdded(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not add to cart. Try again.');
    } finally {
      setPending(false);
    }
  }

  const soldOut = product.stock === 0;

  return (
    <div className="mt-8 flex flex-col items-start gap-3">
      <button
        type="button"
        onClick={() => void handleAdd()}
        disabled={pending || soldOut}
        className="cursor-pointer rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {soldOut ? 'Sold out' : pending ? 'Adding…' : 'Add to cart'}
      </button>
      {added ? (
        <p className="text-sm text-zinc-600" role="status">
          Added to cart.{' '}
          <Link href="/cart" className="font-medium text-zinc-900 underline">
            View cart
          </Link>
        </p>
      ) : null}
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
