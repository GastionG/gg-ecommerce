import type { ReactNode } from 'react';

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 px-6 py-16 text-center">
      <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-zinc-600">
        {description}
      </p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
