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

export type CheckoutSession = {
  url: string;
};

export const ORDER_STATUSES = ['PENDING', 'PAID', 'FAILED'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type OrderLine = {
  id: number;
  name: string;
  priceCents: number;
  quantity: number;
  lineTotalCents: number;
};

export type Order = {
  id: number;
  status: OrderStatus;
  totalCents: number;
  createdAt: string;
  items: OrderLine[];
};

export type AdminOrder = Order & {
  email: string;
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

const slugSchema = z
  .string()
  .trim()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use a lowercase slug, like apex-pro-tkl');

export const productWriteSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  slug: slugSchema,
  description: z.string().trim().min(1, 'Description is required'),
  priceCents: z.number().int().nonnegative(),
  imageUrl: z.string().trim().url('Enter an image URL'),
  stock: z.number().int().nonnegative(),
  categorySlug: z.string().trim().min(1, 'Category is required'),
});

export const productPatchSchema = productWriteSchema.partial();

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type AddCartItemInput = z.infer<typeof addCartItemSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
export type ProductWriteInput = z.infer<typeof productWriteSchema>;
export type ProductPatchInput = z.infer<typeof productPatchSchema>;

export function formatPrice(priceCents: number, currency = 'USD') {
  const amount = (Math.round(priceCents) / 100).toFixed(2);
  if (currency === 'USD') return `$${amount}`;
  return `${amount} ${currency}`;
}
