import Link from 'next/link';
import { getProducts } from '@/lib/api';
import { uniqueCategories } from '@/lib/catalog';
import { EmptyState } from '@/components/empty-state';
import { ProductGrid } from '@/components/product-grid';

export default async function HomePage() {
  const products = await getProducts();
  const categories = uniqueCategories(products);
  const featured = products.slice(0, 6);

  return (
    <div className="flex flex-col gap-12">
      <section className="rounded-3xl bg-zinc-900 px-6 py-14 text-white dark:bg-zinc-100 dark:text-zinc-900 sm:px-10">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
          Catalog
        </p>
        <h1 className="mt-3 max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Gear for the next session
        </h1>
        <p className="mt-4 max-w-lg text-base text-zinc-300 dark:text-zinc-600">
          Browse products by category, open a detail page, and see live stock
          and pricing from the API.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/products"
            className="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-zinc-900 dark:bg-zinc-900 dark:text-white"
          >
            View catalog
          </Link>
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/products?category=${category.slug}`}
              className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/10 dark:border-zinc-900/20 dark:text-zinc-900 dark:hover:bg-zinc-900/5"
            >
              {category.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl font-semibold tracking-tight">Featured</h2>
          <Link
            href="/products"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            See all
          </Link>
        </div>
        {featured.length === 0 ? (
          <EmptyState
            title="No products yet"
            description="Seed the API and refresh to populate the catalog."
          />
        ) : (
          <ProductGrid products={featured} />
        )}
      </section>
    </div>
  );
}
