import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import type { AdminOrder } from '@gg/shared';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { OrdersService } from '../orders/orders.service.js';
import { ProductsService } from '../products/products.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';

function productId(raw: string): number {
  const id = Number(raw);
  if (!Number.isInteger(id) || id < 1) {
    throw new NotFoundException('Product not found');
  }
  return id;
}

@Controller('admin')
@Roles('ADMIN')
export class AdminController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly ordersService: OrdersService,
  ) {}

  @Get('health')
  health() {
    return { ok: true };
  }

  @Get('orders')
  orders(): Promise<AdminOrder[]> {
    return this.ordersService.listAll();
  }

  @Post('products')
  createProduct(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Patch('products/:id')
  updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(productId(id), dto);
  }

  @Delete('products/:id')
  removeProduct(@Param('id') id: string): Promise<void> {
    return this.productsService.remove(productId(id));
  }
}
