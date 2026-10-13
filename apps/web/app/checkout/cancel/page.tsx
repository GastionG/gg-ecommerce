import type { Metadata } from 'next';
import Link from 'next/link';
import { EmptyState } from '@/components/empty-state';

export const metadata: Metadata = {
  title: 'Checkout cancelled',
};

export default function CheckoutCancelPage() {
  return (
    <EmptyState
      title="Checkout cancelled"
      description="You were not charged. Your cart is still saved."
      action={
        <Link
          href="/cart"
          className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Back to cart
        </Link>
      }
    />
  );
}
