'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';

export function AccountPanel() {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) return null;

  async function handleLogout() {
    await logout();
    router.push('/');
  }

  return (
    <div className="mx-auto w-full max-w-xl">
      <h1 className="text-3xl font-semibold tracking-tight">Account</h1>
      <p className="mt-2 text-sm text-zinc-600">
        You are signed in. The JWT lives in an httpOnly cookie, not in localStorage.
      </p>
      <dl className="mt-8 divide-y divide-zinc-200 rounded-2xl border border-zinc-200 bg-white">
        <div className="flex items-center justify-between gap-4 px-5 py-4">
          <dt className="text-sm text-zinc-500">Email</dt>
          <dd className="text-sm font-medium text-zinc-900">{user.email}</dd>
        </div>
        <div className="flex items-center justify-between gap-4 px-5 py-4">
          <dt className="text-sm text-zinc-500">Role</dt>
          <dd className="text-sm font-medium text-zinc-900">{user.role}</dd>
        </div>
      </dl>
      <button
        type="button"
        onClick={() => void handleLogout()}
        className="mt-6 rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
      >
        Log out
      </button>
    </div>
  );
}
