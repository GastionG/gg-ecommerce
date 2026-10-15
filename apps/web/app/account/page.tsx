import type { Metadata } from 'next';
import { AccountPanel } from '@/components/account-panel';
import { AuthGate } from '@/components/auth-gate';
import { OrderHistory } from '@/components/order-history';

export const metadata: Metadata = {
  title: 'Account',
};

export default function AccountPage() {
  return (
    <AuthGate>
      <AccountPanel />
      <OrderHistory />
    </AuthGate>
  );
}
