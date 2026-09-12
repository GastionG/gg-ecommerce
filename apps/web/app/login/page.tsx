import { Suspense } from 'react';
import type { Metadata } from 'next';
import { LoginForm } from '@/components/login-form';

export const metadata: Metadata = {
  title: 'Log in',
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="mx-auto h-64 w-full max-w-md animate-pulse rounded-2xl bg-zinc-200/70" />}>
      <LoginForm />
    </Suspense>
  );
}
