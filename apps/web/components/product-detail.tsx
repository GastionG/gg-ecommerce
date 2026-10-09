import Link from 'next/link';
import type { Product } from '@gg/shared';
import { AddToCartButton } from './add-to-cart-button';
import { ProductImage } from './product-image';
import { ProductPrice } from './product-price';
import { StockBadge } from './stock-badge';

type ProductDetailProps = {
  product: Product;
};

export function ProductDetail({ product }: ProductDetailProps) {
  return (
    <article className="grid gap-10 lg:grid-cols-2">
      <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-zinc-100">
        <ProductImage
          src={product.imageUrl}
          alt={product.name}
          priority
          className="object-cover"
        />
      </div>
      <div className="flex flex-col">
        <Link
          href={`/products?category=${product.category.slug}`}
          className="text-sm font-medium uppercase tracking-wide text-zinc-500 hover:text-zinc-800"
        >
          {product.category.name}
        </Link>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-zinc-900">
          {product.name}
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <ProductPrice
            priceCents={product.priceCents}
            className="text-2xl font-semibold tabular-nums"
          />
          <StockBadge stock={product.stock} />
        </div>
        <p className="mt-6 max-w-prose text-base leading-7 text-zinc-600">
          {product.description}
        </p>
        {product.stock > 0 ? (
          <p className="mt-4 text-sm text-zinc-500">{product.stock} available</p>
        ) : null}
        <AddToCartButton product={product} />
      </div>
    </article>
  );
}
