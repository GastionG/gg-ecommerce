export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
      <div className="aspect-[4/3] animate-pulse bg-zinc-200" />
      <div className="space-y-3 p-4">
        <div className="h-3 w-16 animate-pulse rounded bg-zinc-200" />
        <div className="h-5 w-2/3 animate-pulse rounded bg-zinc-200" />
        <div className="h-6 w-20 animate-pulse rounded bg-zinc-200" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, index) => (
        <li key={index}>
          <ProductCardSkeleton />
        </li>
      ))}
    </ul>
  );
}
