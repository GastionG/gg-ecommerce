import { Injectable, NotFoundException } from '@nestjs/common';
import type { AdminOrder, Order, OrderStatus } from '@gg/shared';
import { PrismaService } from '../prisma/prisma.service.js';

type OrderRow = {
  id: number;
  status: OrderStatus;
  totalCents: number;
  createdAt: string;
};

type ItemRow = {
  id: number;
  orderId: number;
  name: string;
  priceCents: number;
  quantity: number;
};

export function toOrder(order: OrderRow, items: ItemRow[]): Order {
  return {
    id: order.id,
    status: order.status,
    totalCents: order.totalCents,
    createdAt: order.createdAt,
    items: items
      .filter((item) => item.orderId === order.id)
      .map((item) => ({
        id: item.id,
        name: item.name,
        priceCents: item.priceCents,
        quantity: item.quantity,
        lineTotalCents: item.quantity * item.priceCents,
      })),
  };
}

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async listForUser(userId: number): Promise<Order[]> {
    const orders = await this.prisma.client.orm.public.Order.where({ userId }).all();
    return this.withItems(orders);
  }

  async getForUser(userId: number, orderId: number): Promise<Order> {
    const order = await this.prisma.client.orm.public.Order
      .where({ id: orderId, userId })
      .first();
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    const [mapped] = await this.withItems([order]);
    if (!mapped) {
      throw new NotFoundException('Order not found');
    }
    return mapped;
  }

  async listAll(): Promise<AdminOrder[]> {
    const orders = await this.prisma.client.orm.public.Order.include('user').all();
    const emailById = new Map(orders.map((order) => [order.id, order.user.email]));
    const mapped = await this.withItems(orders);
    return mapped.map((order) => ({
      ...order,
      email: emailById.get(order.id) ?? '',
    }));
  }

  private async withItems<T extends OrderRow>(orders: T[]): Promise<Order[]> {
    const newest = [...orders].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    if (newest.length === 0) return [];

    const items = await this.prisma.client.orm.public.OrderItem
      .where((item) => item.orderId.in(newest.map((order) => order.id)))
      .all();

    return newest.map((order) => toOrder(order, items));
  }
}
