import Link from 'next/link';
import { EmptyState } from '@/components/empty-state';

export default function ProductNotFound() {
  return (
    <EmptyState
      title="Product not found"
      description="No product matches that slug. It may have been removed, or the URL is wrong."
      action={
        <Link
          href="/products"
          className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
        >
          Back to catalog
        </Link>
      }
    />
  );
}
