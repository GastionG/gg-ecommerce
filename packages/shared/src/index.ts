import { z } from 'zod';

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

export const USER_ROLES = ['USER', 'ADMIN'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export type AuthUser = {
  id: number;
  email: string;
  role: UserRole;
};

export const registerSchema = z.object({
  email: z.string().trim().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export function formatPrice(priceCents: number, currency = 'USD') {
  const amount = (Math.round(priceCents) / 100).toFixed(2);
  if (currency === 'USD') return `$${amount}`;
  return `${amount} ${currency}`;
}
