import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) { }

  async findAll() {
    const rows = await this.prisma.client.orm.public.Product
      .include('category')
      .all();
    return rows.map(toProductDto);
  }

  async findBySlug(slug: string) {
    const row = await this.prisma.client.orm.public.Product
      .where({ slug })
      .include('category')
      .first();
    if (!row) {
      throw new NotFoundException(`Product not found: ${slug}`);
    }
    return toProductDto(row);
  }
}

function toCategoryDto(category: { [key: string]: unknown }) {
  const name = category.name;
  const slug = category.slug;
  if (typeof name !== 'string' || typeof slug !== 'string') {
    throw new Error('Product is missing category name/slug');
  }
  return { name, slug };
}

function toProductDto(row: {
  id: number;
  name: string;
  slug: string;
  description: string;
  priceCents: number;
  imageUrl: string;
  stock: number;
  category: { [key: string]: unknown };
}) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    priceCents: row.priceCents,
    imageUrl: row.imageUrl,
    stock: row.stock,
    category: toCategoryDto(row.category),
  };
}