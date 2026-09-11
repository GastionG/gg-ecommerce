export default function ProductLoading() {
  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div className="aspect-[4/3] animate-pulse rounded-3xl bg-zinc-200 dark:bg-zinc-800" />
      <div className="space-y-4">
        <div className="h-4 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-10 w-2/3 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-8 w-28 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-24 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>
    </div>
  );
}
