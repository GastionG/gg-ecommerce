'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Cart, CartItem, Product } from '@gg/shared';
import { useAuth } from '@/components/auth-provider';
import { ApiError, addToCart, getCart, removeCartItem } from '@/lib/api';

type AddToCartButtonProps = {
  product: Pick<Product, 'id' | 'slug' | 'stock'>;
};

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const { user, loading } = useAuth();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cart, setCart] = useState<Cart | null>(null);
  const [item, setItem] = useState<CartItem | null>(null);

  function loadCart() {
    return getCart().then(
      (cart) => {
        setCart(cart);
        setItem(
          cart.items.find((item) => item.product.id === product.id) ?? null,
        );
      },
      () => setError('Could not load your cart. Try again.'),
    );
  }

  useEffect(() => {
    void loadCart();
  }, []);

  if (loading) {
    return (
      <div className="mt-8 h-11 w-40 animate-pulse rounded-full bg-zinc-200" />
    );
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

  async function handleAdd(quantity?: number) {
    setError(null);
    setPending(true);

    try {
      await addToCart({ productId: product.id, quantity: quantity ?? 1 });
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Could not add to cart. Try again.',
      );
    } finally {
      setPending(false);
      void loadCart();
    }
  }

  async function handleRemove(cartItemId: number) {
    setError(null);
    setPending(true);

    try {
      await removeCartItem(cartItemId);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Could not remove from cart. Try again.',
      );
    } finally {
      setPending(false);
      void loadCart();
    }
  }

  const soldOut = product.stock === 0;

  return (
    <div className="mt-8 flex flex-col items-start gap-3">
      {item !== null ? (
        <>
          <p className="text-sm text-zinc-600" role="status">
            Added to cart.{' '}
            <Link href="/cart" className="font-medium text-zinc-900 underline">
              View cart
            </Link>
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label={`Decrease quantity of ${item.product.name}`}
              disabled={item.quantity <= 1}
              onClick={() => void handleAdd(item.quantity - 1)}
              className="cursor-pointer h-8 w-8 rounded-full border border-zinc-300 text-zinc-700 hover:bg-zinc-100 disabled:opacity-40"
            >
              −
            </button>
            <span className="w-6 text-center tabular-nums" aria-live="polite">
              {item.quantity}
            </span>
            <button
              type="button"
              aria-label={`Increase quantity of ${item.product.name}`}
              disabled={item.quantity >= item.product.stock}
              onClick={() => void handleAdd(item.quantity + 1)}
              className="cursor-pointer h-8 w-8 rounded-full border border-zinc-300 text-zinc-700 hover:bg-zinc-100 disabled:opacity-40"
            >
              +
            </button>

            <button
              type="button"
              aria-label={`Remove ${item.product.name} from cart`}
              onClick={() => void handleRemove(item.id)}
              className="cursor-pointer flex items-center justify-center h-8 w-8 rounded-full border border-zinc-300 text-zinc-500 hover:text-red-600 hover:bg-red-50 disabled:opacity-40 ml-2"
              title="Remove from cart"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                width={16}
                height={16}
                aria-hidden="true"
              >
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
              </svg>
            </button>
          </div>
        </>
      ) : (
        <button
          type="button"
          onClick={() => void handleAdd()}
          disabled={pending || soldOut}
          className="cursor-pointer rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {soldOut ? 'Sold out' : pending ? 'Adding…' : 'Add to cart'}
        </button>
      )}

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
