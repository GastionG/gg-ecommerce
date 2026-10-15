import type { Metadata } from 'next';
import { AdminPanel } from '@/components/admin-panel';
import { AuthGate } from '@/components/auth-gate';

export const metadata: Metadata = {
  title: 'Admin',
};

export default function AdminPage() {
  return (
    <AuthGate role="ADMIN">
      <AdminPanel />
    </AuthGate>
  );
}
