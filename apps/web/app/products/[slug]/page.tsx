import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProduct, getProducts } from '@/lib/api';
import { relatedProducts } from '@/lib/catalog';
import { ProductDetail } from '@/components/product-detail';
import { ProductGrid } from '@/components/product-grid';

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: 'Product not found' };
  return {
    title: product.name,
    description: product.description,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const catalog = await getProducts();
  const related = relatedProducts(catalog, product);

  return (
    <div className="flex flex-col gap-14">
      <ProductDetail product={product} />
      {related.length > 0 ? (
        <section className="flex flex-col gap-6">
          <h2 className="text-2xl font-semibold tracking-tight">
            More in {product.category.name}
          </h2>
          <ProductGrid products={related} />
        </section>
      ) : null}
    </div>
  );
}
