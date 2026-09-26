import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { ResultType } from '@prisma/orm-postgres/components';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) { }

  async findAll() {
    const rows = await this.prisma.client.orm.public.Product
      .include('category')
      .all();

    return rows;
  }

  async findBySlug(slug: string) {
    const row = await this.prisma.client.orm.public.Product
      .where({ slug })
      .include('category')
      .first();

    if (!row) {
      throw new NotFoundException(`Product not found: ${slug}`);
    }

    return row;
  }
}
