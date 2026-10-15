import type {
  AddCartItemInput,
  AuthUser,
  Cart,
  CartItem,
  CheckoutSession,
  LoginInput,
  AdminOrder,
  Order,
  Product,
  ProductPatchInput,
  ProductWriteInput,
  RegisterInput,
  UpdateCartItemInput,
} from '@gg/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function apiUrl(path: string) {
  if (!API_URL) {
    throw new Error('NEXT_PUBLIC_API_URL is not set');
  }
  return `${API_URL}${path}`;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function readErrorMessage(res: Response): Promise<string> {
  const body: unknown = await res.json().catch(() => null);
  if (body && typeof body === 'object' && 'message' in body) {
    const message = (body as { message: unknown }).message;
    if (typeof message === 'string') return message;
    if (Array.isArray(message)) return message.join(', ');
  }
  return 'Request failed';
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(apiUrl(path), init);
  if (!res.ok) {
    throw new ApiError(res.status, await readErrorMessage(res));
  }
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export async function getProducts(): Promise<Product[]> {
  return apiFetch<Product[]>('/products', { cache: 'no-store' });
}

export async function getProduct(slug: string): Promise<Product | null> {
  const res = await fetch(apiUrl(`/products/${slug}`), { cache: 'no-store' });
  if (res.status === 404) return null;
  if (!res.ok) throw new ApiError(res.status, await readErrorMessage(res));
  return res.json() as Promise<Product>;
}

function jsonRequest(method: string, body: unknown): RequestInit {
  return {
    method,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

export async function register(input: RegisterInput): Promise<AuthUser> {
  return apiFetch<AuthUser>('/auth/register', jsonRequest('POST', input));
}

export async function login(input: LoginInput): Promise<AuthUser> {
  return apiFetch<AuthUser>('/auth/login', jsonRequest('POST', input));
}

export async function logout(): Promise<void> {
  await apiFetch<{ ok: boolean }>('/auth/logout', {
    method: 'POST',
    credentials: 'include',
  });
}

export async function getMe(): Promise<AuthUser | null> {
  const res = await fetch(apiUrl('/auth/me'), {
    credentials: 'include',
    cache: 'no-store',
  });
  if (res.status === 401) return null;
  if (!res.ok) throw new ApiError(res.status, await readErrorMessage(res));
  return res.json() as Promise<AuthUser>;
}

export async function getCart(): Promise<Cart> {
  return apiFetch<Cart>('/cart', { credentials: 'include', cache: 'no-store' });
}

export async function addToCart(input: AddCartItemInput): Promise<CartItem> {
  return apiFetch<CartItem>('/cart/items', jsonRequest('POST', input));
}

export async function updateCartItem(
  id: number,
  input: UpdateCartItemInput,
): Promise<CartItem> {
  return apiFetch<CartItem>(`/cart/items/${id}`, jsonRequest('PATCH', input));
}

export async function startCheckout(): Promise<CheckoutSession> {
  return apiFetch<CheckoutSession>('/checkout/session', {
    method: 'POST',
    credentials: 'include',
  });
}

export async function getOrders(): Promise<Order[]> {
  return apiFetch<Order[]>('/orders', { credentials: 'include', cache: 'no-store' });
}

export async function getOrder(id: number): Promise<Order> {
  return apiFetch<Order>(`/orders/${id}`, { credentials: 'include', cache: 'no-store' });
}

export async function getAdminOrders(): Promise<AdminOrder[]> {
  return apiFetch<AdminOrder[]>('/admin/orders', {
    credentials: 'include',
    cache: 'no-store',
  });
}

export async function createProduct(input: ProductWriteInput): Promise<Product> {
  return apiFetch<Product>('/admin/products', jsonRequest('POST', input));
}

export async function updateProduct(id: number, input: ProductPatchInput): Promise<Product> {
  return apiFetch<Product>(`/admin/products/${id}`, jsonRequest('PATCH', input));
}

export async function deleteProduct(id: number): Promise<void> {
  await apiFetch<void>(`/admin/products/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
}

export async function removeCartItem(id: number): Promise<void> {
  await apiFetch<void>(`/cart/items/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
}
