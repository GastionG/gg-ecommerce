'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { APP_NAME } from '@gg/shared';
import { AuthNav } from '@/components/auth-nav';

const linkClass = 'hover:text-zinc-900';
const menuLinkClass = 'rounded-lg px-3 py-2 hover:bg-zinc-100 hover:text-zinc-900';

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  function close() {
    setOpen(false);
  }

  return (
    <header className="border-b border-zinc-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" onClick={close} className="flex items-center gap-2 font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-xs text-white">
            GG
          </span>
          <span className="text-zinc-900">{APP_NAME}</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-zinc-600 md:flex">
          <Link href="/" className={linkClass}>
            Home
          </Link>
          <Link href="/products" className={linkClass}>
            Catalog
          </Link>
          <AuthNav />
        </nav>
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-zinc-900 hover:bg-zinc-100 md:hidden"
          aria-expanded={open}
          aria-controls="site-menu"
          onClick={() => setOpen((current) => !current)}
        >
          <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
          {open ? (
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
          )}
        </button>
      </div>
      {open ? (
        <nav
          id="site-menu"
          className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-4 pb-4 text-sm font-medium text-zinc-600 sm:px-6 md:hidden"
        >
          <Link href="/" onClick={close} className={menuLinkClass}>
            Home
          </Link>
          <Link href="/products" onClick={close} className={menuLinkClass}>
            Catalog
          </Link>
          <AuthNav direction="column" onNavigate={close} />
        </nav>
      ) : null}
    </header>
  );
}
