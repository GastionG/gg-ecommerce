'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';

export function AuthNav() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  if (loading) {
    return <div className="h-5 w-28 animate-pulse rounded bg-zinc-200" />;
  }

  if (!user) {
    return (
      <>
        <Link href="/login" className="hover:text-zinc-900">
          Log in
        </Link>
        <Link
          href="/register"
          className="rounded-full bg-zinc-900 px-3 py-1.5 text-white hover:bg-zinc-800"
        >
          Register
        </Link>
      </>
    );
  }

  async function handleLogout() {
    await logout();
    router.push('/');
  }

  return (
    <>
      {user.role === 'ADMIN' ? (
        <Link href="/admin" className="hover:text-zinc-900">
          Admin
        </Link>
      ) : null}
      <Link href="/cart" className="hover:text-zinc-900">
        Cart
      </Link>
      <Link href="/account" className="hover:text-zinc-900">
        {user.email}
      </Link>
      <button
        type="button"
        onClick={() => void handleLogout()}
        className="hover:text-zinc-900"
      >
        Log out
      </button>
    </>
  );
}
