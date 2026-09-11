import Link from 'next/link';
import { APP_NAME } from '@gg/shared';

export function SiteHeader() {
  return (
    <header className="border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-xs text-white dark:bg-zinc-100 dark:text-zinc-900">
            GG
          </span>
          <span className="text-zinc-900 dark:text-zinc-50">{APP_NAME}</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-300">
          <Link href="/" className="hover:text-zinc-900 dark:hover:text-white">
            Home
          </Link>
          <Link
            href="/products"
            className="hover:text-zinc-900 dark:hover:text-white"
          >
            Catalog
          </Link>
        </nav>
      </div>
    </header>
  );
}
