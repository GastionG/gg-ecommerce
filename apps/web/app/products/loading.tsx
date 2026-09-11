import { ProductGridSkeleton } from '@/components/product-card-skeleton';

export default function ProductsLoading() {
  return (
    <div className="flex flex-col gap-8">
      <div className="space-y-3">
        <div className="h-9 w-40 animate-pulse rounded bg-zinc-200" />
        <div className="h-5 w-32 animate-pulse rounded bg-zinc-200" />
        <div className="flex gap-2">
          <div className="h-8 w-16 animate-pulse rounded-full bg-zinc-200" />
          <div className="h-8 w-24 animate-pulse rounded-full bg-zinc-200" />
          <div className="h-8 w-20 animate-pulse rounded-full bg-zinc-200" />
        </div>
      </div>
      <ProductGridSkeleton />
    </div>
  );
}
