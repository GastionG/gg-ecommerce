import Link from 'next/link';
import type { Metadata } from 'next';
import { getProducts } from '@/lib/api';
import { filterByCategory, uniqueCategories } from '@/lib/catalog';
import { CategoryFilters } from '@/components/category-filters';
import { EmptyState } from '@/components/empty-state';
import { ProductGrid } from '@/components/product-grid';

export const metadata: Metadata = {
  title: 'Catalog',
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const products = await getProducts();
  const categories = uniqueCategories(products);
  const visible = filterByCategory(products, category);
  const activeCategory = categories.find((item) => item.slug === category);
  const countLabel = category
    ? `${visible.length} in ${activeCategory?.name ?? category}`
    : `${products.length} products`;

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">Catalog</h1>
        <p className="text-zinc-600">{countLabel}</p>
        <CategoryFilters categories={categories} activeSlug={category} />
      </header>

      {visible.length === 0 ? (
        <EmptyState
          title={category ? 'No products in this category' : 'No products yet'}
          description={
            category
              ? 'Try another category or view the full catalog.'
              : 'Seed the API and refresh to populate the catalog.'
          }
          action={
            category ? (
              <Link
                href="/products"
                className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
              >
                View all
              </Link>
            ) : null
          }
        />
      ) : (
        <ProductGrid products={visible} />
      )}
    </div>
  );
}
