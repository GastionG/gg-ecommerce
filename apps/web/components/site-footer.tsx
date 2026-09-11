import { APP_NAME } from '@gg/shared';

export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-200 py-8 text-center text-sm text-zinc-500">
      <p>{APP_NAME}</p>
    </footer>
  );
}
