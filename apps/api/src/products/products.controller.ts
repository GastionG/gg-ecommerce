import { Controller, Get, Param } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator.js';
import { ProductsService } from './products.service.js';

@Public()
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @Get()
  async findAll() {
    return this.productsService.findAll();
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }
}
