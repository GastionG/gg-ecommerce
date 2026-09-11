import Link from 'next/link';
import type { Category } from '@gg/shared';

type CategoryFiltersProps = {
  categories: Category[];
  activeSlug?: string;
  basePath?: string;
};

export function CategoryFilters({
  categories,
  activeSlug,
  basePath = '/products',
}: CategoryFiltersProps) {
  if (categories.length === 0) return null;

  const chipClass = (active: boolean) =>
    `rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
      active
        ? 'bg-zinc-900 text-white'
        : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
    }`;

  return (
    <nav aria-label="Categories" className="flex flex-wrap gap-2">
      <Link href={basePath} className={chipClass(!activeSlug)}>
        All
      </Link>
      {categories.map((category) => (
        <Link
          key={category.slug}
          href={`${basePath}?category=${category.slug}`}
          className={chipClass(activeSlug === category.slug)}
        >
          {category.name}
        </Link>
      ))}
    </nav>
  );
}
