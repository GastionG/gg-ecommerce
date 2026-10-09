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

export type Cart = {
  id: number;
  items: CartItem[];
  subtotalCents: number;
}

export type CartItem = {
  id: number;
  quantity: number;
  lineTotalCents: number;
  product: Product;
};

export const registerSchema = z.object({
  email: z.string().trim().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export const addCartItemSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().positive().default(1),
});


export const updateCartItemSchema = z.object({
  quantity: z.number().int().positive().default(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type AddCartItemInput = z.infer<typeof addCartItemSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;

export function formatPrice(priceCents: number, currency = 'USD') {
  const amount = (Math.round(priceCents) / 100).toFixed(2);
  if (currency === 'USD') return `$${amount}`;
  return `${amount} ${currency}`;
}
