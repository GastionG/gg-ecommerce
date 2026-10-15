'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';

type AuthNavProps = {
  direction?: 'row' | 'column';
  onNavigate?: () => void;
};

export function AuthNav({ direction = 'row', onNavigate }: AuthNavProps) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const stacked = direction === 'column';
  const item = stacked
    ? 'rounded-lg px-3 py-2 text-left hover:bg-zinc-100 hover:text-zinc-900'
    : 'hover:text-zinc-900';

  if (loading) {
    return <div className="h-5 w-28 animate-pulse rounded bg-zinc-200" />;
  }

  if (!user) {
    const links = (
      <>
        <Link href="/login" onClick={onNavigate} className={item}>
          Log in
        </Link>
        <Link
          href="/register"
          onClick={onNavigate}
          className={
            stacked
              ? 'rounded-lg bg-zinc-900 px-3 py-2 text-center text-white hover:bg-zinc-800'
              : 'rounded-full bg-zinc-900 px-3 py-1.5 text-white hover:bg-zinc-800'
          }
        >
          Register
        </Link>
      </>
    );
    return stacked ? <div className="flex flex-col gap-1">{links}</div> : links;
  }

  async function handleLogout() {
    await logout();
    onNavigate?.();
    router.push('/');
  }

  const links = (
    <>
      {user.role === 'ADMIN' ? (
        <Link href="/admin" onClick={onNavigate} className={item}>
          Admin
        </Link>
      ) : null}
      <Link href="/cart" onClick={onNavigate} className={item}>
        Cart
      </Link>
      <Link href="/account" onClick={onNavigate} className={`${item} break-all`}>
        {user.email}
      </Link>
      <button type="button" onClick={() => void handleLogout()} className={item}>
        Log out
      </button>
    </>
  );

  return stacked ? <div className="flex flex-col gap-1">{links}</div> : links;
}
