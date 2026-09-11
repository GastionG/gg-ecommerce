import type { Product } from '@gg/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function apiUrl(path: string) {
  if (!API_URL) {
    throw new Error('NEXT_PUBLIC_API_URL is not set');
  }
  return `${API_URL}${path}`;
}

export async function getProducts(): Promise<Product[]> {
  const res = await fetch(apiUrl('/products'), { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load products');
  return res.json();
}

export async function getProduct(slug: string): Promise<Product | null> {
  const res = await fetch(apiUrl(`/products/${slug}`), { cache: 'no-store' });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to load product');
  return res.json();
}
