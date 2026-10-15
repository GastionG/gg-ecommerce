import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import type { AuthUser, Order } from '@gg/shared';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { OrdersService } from './orders.service.js';

function orderId(raw: string): number {
  const id = Number(raw);
  if (!Number.isInteger(id) || id < 1) {
    throw new NotFoundException('Order not found');
  }
  return id;
}

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  list(@CurrentUser() user: AuthUser): Promise<Order[]> {
    return this.ordersService.listForUser(user.id);
  }

  @Get(':id')
  get(@CurrentUser() user: AuthUser, @Param('id') id: string): Promise<Order> {
    return this.ordersService.getForUser(user.id, orderId(id));
  }
}
