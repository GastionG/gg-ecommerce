import { z } from 'zod';

export const APP_NAME = 'gg-ecommerce';

export type Category = {
  name: string;
  slug: string;
};

export const PRODUCT_OPTION_UIS = ['select', 'swatch'] as const;
export type ProductOptionUi = (typeof PRODUCT_OPTION_UIS)[number];

export type ProductOptionValue = {
  key: string;
  label: string;
  hex?: string;
};

export type ProductOption = {
  key: string;
  label: string;
  ui: ProductOptionUi;
  values: ProductOptionValue[];
};

export type ProductVariant = {
  id: number;
  stock: number;
  priceCents: number;
  imageUrl: string;
  sku?: string;
  selections: Record<string, string>;
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
  options: ProductOption[];
  variants: ProductVariant[];
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
};

export type CartItem = {
  id: number;
  quantity: number;
  lineTotalCents: number;
  product: Product;
  variant: ProductVariant;
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
  variantId: z.number().int().positive(),
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

export function findVariant(
  product: Pick<Product, 'variants'>,
  selections: Record<string, string>,
): ProductVariant | undefined {
  return product.variants.find((variant) => {
    const keys = Object.keys(variant.selections);
    if (keys.length !== Object.keys(selections).length) return false;
    return keys.every((key) => variant.selections[key] === selections[key]);
  });
}

export function variantLabel(
  product: Pick<Product, 'options'>,
  variant: Pick<ProductVariant, 'selections'>,
): string {
  return product.options
    .map((option) => {
      const key = variant.selections[option.key];
      const value = option.values.find((entry) => entry.key === key);
      return value ? `${option.label} ${value.label}` : null;
    })
    .filter((part): part is string => part !== null)
    .join(', ');
}

export function lineName(
  product: Pick<Product, 'name' | 'options'>,
  variant: Pick<ProductVariant, 'selections'>,
): string {
  const suffix = variantLabel(product, variant);
  return suffix ? `${product.name} — ${suffix}` : product.name;
}

export function optionValueAvailable(
  product: Pick<Product, 'variants'>,
  optionKey: string,
  valueKey: string,
  selections: Record<string, string>,
): boolean {
  const next = { ...selections, [optionKey]: valueKey };
  return product.variants.some(
    (variant) =>
      variant.stock > 0 &&
      Object.entries(next).every(
        ([key, value]) => !value || variant.selections[key] === value,
      ),
  );
}
