'use client';

import { useEffect, useRef, useState } from 'react';
import {
  formatPrice,
  productWriteSchema,
  type AdminOrder,
  type Product,
} from '@gg/shared';
import {
  ApiError,
  createProduct,
  deleteProduct,
  getAdminOrders,
  getProducts,
  updateProduct,
} from '@/lib/api';
import Link from 'next/link.js';

const fieldClass =
  'rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-900';

type Draft = {
  name: string;
  slug: string;
  description: string;
  price: string;
  imageUrl: string;
  stock: string;
  categorySlug: string;
};

const emptyDraft: Draft = {
  name: '',
  slug: '',
  description: '',
  price: '',
  imageUrl: 'https://picsum.photos/seed/new-product/800/600',
  stock: '0',
  categorySlug: 'keyboards',
};

const fields = [
  ['name', 'Name'],
  ['slug', 'Slug'],
  ['price', 'Price in dollars'],
  ['stock', 'Stock'],
  ['categorySlug', 'Category slug'],
  ['imageUrl', 'Image URL'],
] as const;

function centsFromDollars(value: string): number | null {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) return null;
  return Math.round(amount * 100);
}

function draftFrom(product: Product): Draft {
  return {
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: (product.priceCents / 100).toFixed(2),
    imageUrl: product.imageUrl,
    stock: String(product.stock),
    categorySlug: product.category.slug,
  };
}

function formatWhen(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export function AdminPanel() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [products, setProducts] = useState<Product[] | null>(null);
  const [orders, setOrders] = useState<AdminOrder[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<number | 'save' | null>(null);
  const [editor, setEditor] = useState<Product | 'create' | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);

  function load() {
    return Promise.all([getProducts(), getAdminOrders()]).then(
      ([nextProducts, nextOrders]) => {
        setProducts(nextProducts);
        setOrders(nextOrders);
      },
      (err: unknown) => {
        setError(
          err instanceof ApiError ? err.message : 'Could not load admin data.',
        );
      },
    );
  }

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (editor) {
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [editor]);

  function openEditor(product?: Product) {
    setFormError(null);
    setDraft(product ? draftFrom(product) : emptyDraft);
    setEditor(product ?? 'create');
  }

  async function remove(product: Product) {
    if (!window.confirm(`Delete ${product.name}?`)) return;
    setError(null);
    setPendingId(product.id);
    try {
      await deleteProduct(product.id);
      await load();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Could not delete the product.',
      );
    } finally {
      setPendingId(null);
    }
  }

  async function saveProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    const priceCents = centsFromDollars(draft.price);
    const parsed = productWriteSchema.safeParse({
      name: draft.name,
      slug: draft.slug,
      description: draft.description,
      priceCents: priceCents ?? -1,
      imageUrl: draft.imageUrl,
      stock: Number(draft.stock),
      categorySlug: draft.categorySlug,
    });
    if (!parsed.success) {
      setFormError(
        parsed.error.issues[0]?.message ?? 'Check the form and try again',
      );
      return;
    }

    setPendingId('save');
    try {
      if (editor === 'create') {
        await createProduct(parsed.data);
      } else if (editor) {
        await updateProduct(editor.id, parsed.data);
      }
      setEditor(null);
      await load();
    } catch (err) {
      setFormError(
        err instanceof ApiError ? err.message : 'Could not save the product.',
      );
    } finally {
      setPendingId(null);
    }
  }

  const editing = editor !== null && editor !== 'create';

  return (
    <div className="flex flex-col gap-12">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Admin</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Create or edit a product, then open the catalog to confirm it. A
          normal account gets 403 on these routes.
        </p>
      </div>

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Products</h2>
          <button
            type="button"
            onClick={() => openEditor()}
            className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            New product
          </button>
        </div>
        {!products ? (
          <div className="h-24 animate-pulse rounded-2xl bg-zinc-200/70" />
        ) : null}
        {products ? (
          <ul className="divide-y divide-zinc-200 rounded-2xl border border-zinc-200 bg-white">
            {products.map((product) => {
              const busy = pendingId === product.id;
              return (
                <li
                  key={product.id}
                  className="flex flex-wrap items-center gap-3 px-5 py-4"
                >
                  <div className="min-w-40 flex-1">
                    <Link href={`/products/${product.slug}`}>
                      <p className="font-medium">{product.name}</p>
                    </Link>
                    <p className="text-sm text-zinc-500">
                      {product.category.name} · stock {product.stock} ·{' '}
                      {formatPrice(product.priceCents)}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => openEditor(product)}
                    className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-100 disabled:opacity-40"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void remove(product)}
                    className="text-sm text-zinc-500 hover:text-red-600 disabled:opacity-40"
                  >
                    Delete
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
      </section>

      <dialog
        ref={dialogRef}
        onClose={() => setEditor(null)}
        onClick={(event) => {
          if (event.target === dialogRef.current) setEditor(null);
        }}
        className="w-full max-w-lg rounded-2xl border border-zinc-200 p-0 backdrop:bg-zinc-900/40 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <form
          onSubmit={(event) => void saveProduct(event)}
          className="flex flex-col gap-3 p-6"
        >
          <h3 className="text-lg font-semibold">
            {editing ? `Edit ${editor.name}` : 'New product'}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {fields.map(([key, label]) => (
              <label
                key={key}
                className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700"
              >
                {label}
                <input
                  value={draft[key]}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      [key]: event.target.value,
                    }))
                  }
                  className={fieldClass}
                  required
                />
              </label>
            ))}
            <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700 sm:col-span-2">
              Description
              <textarea
                value={draft.description}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                className={fieldClass}
                rows={3}
                required
              />
            </label>
          </div>
          {formError ? (
            <p className="text-sm text-red-600" role="alert">
              {formError}
            </p>
          ) : null}
          <div className="mt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setEditor(null)}
              className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pendingId === 'save'}
              className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {pendingId === 'save'
                ? 'Saving…'
                : editing
                  ? 'Save changes'
                  : 'Create product'}
            </button>
          </div>
        </form>
      </dialog>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold tracking-tight">Orders</h2>
        {!orders ? (
          <div className="h-24 animate-pulse rounded-2xl bg-zinc-200/70" />
        ) : null}
        {orders && orders.length === 0 ? (
          <p className="text-sm text-zinc-600">No orders yet.</p>
        ) : null}
        {orders && orders.length > 0 ? (
          <ul className="divide-y divide-zinc-200 rounded-2xl border border-zinc-200 bg-white">
            {orders.map((order) => (
              <li key={order.id} className="px-5 py-4">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <p className="font-medium">
                    Order #{order.id}{' '}
                    <span className="font-normal text-zinc-500">
                      {order.email}
                    </span>
                  </p>
                  <p className="text-sm text-zinc-600">
                    {order.status} · {formatPrice(order.totalCents)}
                  </p>
                </div>
                <p className="mt-1 text-sm text-zinc-500">
                  {formatWhen(order.createdAt)}
                </p>
                <p className="mt-2 text-sm text-zinc-700">
                  {order.items
                    .map((item) => `${item.name} × ${item.quantity}`)
                    .join(', ')}
                </p>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </div>
  );
}
