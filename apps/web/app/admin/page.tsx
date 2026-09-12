import type { Metadata } from 'next';
import { AuthGate } from '@/components/auth-gate';

export const metadata: Metadata = {
  title: 'Admin',
};

export default function AdminPage() {
  return (
    <AuthGate role="ADMIN">
      <div className="mx-auto w-full max-w-xl">
        <h1 className="text-3xl font-semibold tracking-tight">Admin</h1>
        <p className="mt-3 text-zinc-600">
          Product and order management lands in Phase 6. This page is here so
          the <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-sm">ADMIN</code>{' '}
          role and API guard can be demoed now.
        </p>
      </div>
    </AuthGate>
  );
}
