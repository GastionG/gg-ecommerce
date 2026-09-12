'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { registerSchema } from '@gg/shared';
import { useAuth } from '@/components/auth-provider';
import { ApiError, register } from '@/lib/api';

export function RegisterForm() {
  const router = useRouter();
  const { user, loading, setUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (!loading && user) {
    router.replace('/account');
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const parsed = registerSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Check the form and try again');
      return;
    }

    setPending(true);
    try {
      const authUser = await register(parsed.data);
      setUser(authUser);
      router.push('/account');
    } catch (err) {
      if (err instanceof ApiError && (err.status === 409 || err.status === 400)) {
        setError(err.message);
      } else {
        setError('Could not create the account. Try again.');
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <h1 className="text-3xl font-semibold tracking-tight">Create an account</h1>
      <p className="mt-2 text-sm text-zinc-600">
        Already registered?{' '}
        <Link href="/login" className="font-medium text-zinc-900 underline">
          Log in
        </Link>
        .
      </p>
      <form onSubmit={(event) => void handleSubmit(event)} className="mt-8 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
          Email
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-base font-normal text-zinc-900 outline-none focus:border-zinc-900"
            required
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
          Password
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            className="rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-base font-normal text-zinc-900 outline-none focus:border-zinc-900"
            required
          />
        </label>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={pending}
          className="mt-2 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
        >
          {pending ? 'Creating…' : 'Register'}
        </button>
      </form>
    </div>
  );
}
