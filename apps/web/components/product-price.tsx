import { formatPrice } from '@gg/shared';

type ProductPriceProps = {
  priceCents: number;
  className?: string;
};

export function ProductPrice({ priceCents, className }: ProductPriceProps) {
  return (
    <span className={className ?? 'font-semibold tabular-nums'}>
      {formatPrice(priceCents)}
    </span>
  );
}
