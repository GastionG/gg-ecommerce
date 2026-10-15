import type { Metadata } from 'next';
import { AuthGate } from '@/components/auth-gate';
import { OrderDetail } from '@/components/order-detail';

export const metadata: Metadata = {
  title: 'Order',
};

type OrderPageProps = {
  params: Promise<{ id: string }>;
};

export default async function OrderPage({ params }: OrderPageProps) {
  const { id } = await params;
  return (
    <AuthGate>
      <OrderDetail id={Number(id)} />
    </AuthGate>
  );
}
