import type { AuthUser, LoginInput, Product, RegisterInput } from '@gg/shared';

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
  if (res.status === 204) {
    return undefined as T;
  }
  return res.json() as Promise<T>;
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

export async function register(input: RegisterInput): Promise<AuthUser> {
  return apiFetch<AuthUser>('/auth/register', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
}

export async function login(input: LoginInput): Promise<AuthUser> {
  return apiFetch<AuthUser>('/auth/login', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
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
