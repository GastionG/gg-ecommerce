import type { Metadata } from 'next';
import { AuthGate } from '@/components/auth-gate';
import { CartView } from '@/components/cart-view';

export const metadata: Metadata = {
  title: 'Cart',
};

export default function CartPage() {
  return (
    <AuthGate>
      <CartView />
    </AuthGate>
  );
}
