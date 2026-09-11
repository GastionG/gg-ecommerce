import type { Category, Product } from '@gg/shared';

export function uniqueCategories(products: Product[]): Category[] {
  const seen = new Map<string, Category>();
  for (const product of products) {
    if (!seen.has(product.category.slug)) {
      seen.set(product.category.slug, product.category);
    }
  }
  return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function filterByCategory(products: Product[], categorySlug?: string) {
  if (!categorySlug) return products;
  return products.filter((product) => product.category.slug === categorySlug);
}

export function relatedProducts(
  products: Product[],
  current: Product,
  limit = 4,
) {
  return products
    .filter(
      (product) =>
        product.slug !== current.slug &&
        product.category.slug === current.category.slug,
    )
    .slice(0, limit);
}
