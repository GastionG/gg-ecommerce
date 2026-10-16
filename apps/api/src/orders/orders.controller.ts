import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import type { AuthUser, Order } from '@gg/shared';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { OrdersService } from './orders.service.js';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  list(@CurrentUser() user: AuthUser): Promise<Order[]> {
    return this.ordersService.listForUser(user.id);
  }

  @Get(':id')
  get(@CurrentUser() user: AuthUser, @Param('id', ParseIntPipe) id: number): Promise<Order> {
    return this.ordersService.getForUser(user.id, id);
  }
}
