import type { Metadata } from 'next';
import Link from 'next/link';
import { EmptyState } from '@/components/empty-state';

export const metadata: Metadata = {
  title: 'Payment received',
};

export default function CheckoutSuccessPage() {
  return (
    <EmptyState
      title="Thanks for your order!"
      description="Your payment went through. We confirm the order as soon as Stripe notifies us, which usually takes a few seconds."
      action={
        <Link
          href="/products"
          className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Keep shopping
        </Link>
      }
    />
  );
}
