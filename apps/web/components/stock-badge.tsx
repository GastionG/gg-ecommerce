type StockBadgeProps = {
  stock: number;
};

export function StockBadge({ stock }: StockBadgeProps) {
  if (stock <= 0) {
    return (
      <span className="inline-flex rounded-full bg-zinc-200/90 px-2.5 py-0.5 text-xs font-medium text-zinc-700 shadow-sm backdrop-blur dark:bg-zinc-800/90 dark:text-zinc-300">
        Out of stock
      </span>
    );
  }

  if (stock <= 5) {
    return (
      <span className="inline-flex rounded-full bg-amber-100/90 px-2.5 py-0.5 text-xs font-medium text-amber-800 shadow-sm backdrop-blur dark:bg-amber-950/90 dark:text-amber-200">
        Low stock
      </span>
    );
  }

  return (
      <span className="inline-flex rounded-full bg-emerald-100/90 px-2.5 py-0.5 text-xs font-medium text-emerald-800 shadow-sm backdrop-blur dark:bg-emerald-950/90 dark:text-emerald-200">
      In stock
    </span>
  );
}
