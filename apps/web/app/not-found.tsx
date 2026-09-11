import Link from 'next/link';
import { EmptyState } from '@/components/empty-state';

export default function NotFound() {
  return (
    <EmptyState
      title="Page not found"
      description="That route does not exist, or the product slug is not in the catalog."
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
