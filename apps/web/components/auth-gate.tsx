'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { UserRole } from '@gg/shared';
import { useAuth } from '@/components/auth-provider';
import { EmptyState } from '@/components/empty-state';

type AuthGateProps = {
  children: React.ReactNode;
  role?: UserRole;
};

export function AuthGate({ children, role }: AuthGateProps) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      const next = encodeURIComponent(pathname);
      router.replace(`/login?next=${next}`);
    }
  }, [loading, pathname, router, user]);

  if (loading || !user) {
    return (
      <div className="h-24 animate-pulse rounded-2xl bg-zinc-200/70" />
    );
  }

  if (role && user.role !== role) {
    return (
      <EmptyState
        title="Forbidden"
        description="This page is limited to admin accounts."
      />
    );
  }

  return children;
}
