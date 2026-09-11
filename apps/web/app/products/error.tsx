'use client';

import { EmptyState } from '@/components/empty-state';

export default function ProductsError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <EmptyState
      title="Could not load products"
      description="The catalog API did not respond. Check that the API is running, then try again."
      action={
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          Try again
        </button>
      }
    />
  );
}
