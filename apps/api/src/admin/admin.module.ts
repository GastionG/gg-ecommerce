import { Module } from '@nestjs/common';
import { OrdersModule } from '../orders/orders.module.js';
import { ProductsModule } from '../products/products.module.js';
import { AdminController } from './admin.controller.js';

@Module({
  imports: [ProductsModule, OrdersModule],
  controllers: [AdminController],
})
export class AdminModule {}
