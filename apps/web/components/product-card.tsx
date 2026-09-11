import Link from 'next/link';
import type { Product } from '@gg/shared';
import { ProductImage } from './product-image';
import { ProductPrice } from './product-price';
import { StockBadge } from './stock-badge';

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100">
        <ProductImage
          src={product.imageUrl}
          alt={product.name}
          className="object-cover transition duration-300 group-hover:scale-105"
        />
        <div className="absolute right-3 bottom-3">
          <StockBadge stock={product.stock} />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          {product.category.name}
        </p>
        <h2 className="text-base font-semibold text-zinc-900">
          {product.name}
        </h2>
        <ProductPrice
          priceCents={product.priceCents}
          className="mt-auto text-lg font-semibold tabular-nums text-zinc-900"
        />
      </div>
    </Link>
  );
}
