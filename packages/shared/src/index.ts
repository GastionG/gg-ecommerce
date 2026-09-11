export const APP_NAME = 'gg-ecommerce';

export type Category = {
  name: string;
  slug: string;
};

export type Product = {
  id: number;
  name: string;
  slug: string;
  description: string;
  priceCents: number;
  imageUrl: string;
  stock: number;
  category: Category;
};

export function formatPrice(priceCents: number, currency = 'USD') {
  const amount = (Math.round(priceCents) / 100).toFixed(2);
  if (currency === 'USD') return `$${amount}`;
  return `${amount} ${currency}`;
}
