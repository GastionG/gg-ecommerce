import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateProductDto } from '../admin/dto/create-product.dto.js';
import type { UpdateProductDto } from '../admin/dto/update-product.dto.js';

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

  async create(dto: CreateProductDto) {
    const categoryId = await this.categoryId(dto.categorySlug);
    try {
      const created = await this.prisma.client.orm.public.Product.create({
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        priceCents: dto.priceCents,
        imageUrl: dto.imageUrl,
        stock: dto.stock,
        categoryId,
      });
      return this.findById(created.id);
    } catch (error) {
      rethrowProductWrite(error);
    }
  }

  async update(id: number, dto: UpdateProductDto) {
    const existing = await this.prisma.client.orm.public.Product.where({ id }).first();
    if (!existing) {
      throw new NotFoundException(`Product not found: ${id}`);
    }

    const data: {
      name?: string;
      slug?: string;
      description?: string;
      priceCents?: number;
      imageUrl?: string;
      stock?: number;
      categoryId?: number;
    } = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.slug !== undefined) data.slug = dto.slug;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.priceCents !== undefined) data.priceCents = dto.priceCents;
    if (dto.imageUrl !== undefined) data.imageUrl = dto.imageUrl;
    if (dto.stock !== undefined) data.stock = dto.stock;
    if (dto.categorySlug !== undefined) data.categoryId = await this.categoryId(dto.categorySlug);

    if (Object.keys(data).length === 0) {
      return this.findById(id);
    }

    try {
      const updated = await this.prisma.client.orm.public.Product.where({ id }).update(data);
      if (!updated) {
        throw new NotFoundException(`Product not found: ${id}`);
      }
      return this.findById(id);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      rethrowProductWrite(error);
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const deleted = await this.prisma.client.orm.public.Product.where({ id }).delete();
      if (!deleted) {
        throw new NotFoundException(`Product not found: ${id}`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      rethrowProductWrite(error);
    }
  }

  private async findById(id: number) {
    const row = await this.prisma.client.orm.public.Product
      .where({ id })
      .include('category')
      .first();
    if (!row) {
      throw new NotFoundException(`Product not found: ${id}`);
    }
    return row;
  }

  private async categoryId(slug: string): Promise<number> {
    const category = await this.prisma.client.orm.public.Category.where({ slug }).first();
    if (!category) {
      throw new NotFoundException(`Category not found: ${slug}`);
    }
    return category.id;
  }
}

function rethrowProductWrite(error: unknown): never {
  const sqlState = (error as { sqlState?: string }).sqlState;
  if (sqlState === '23505') {
    throw new ConflictException('A product with that slug already exists');
  }
  if (sqlState === '23503') {
    throw new ConflictException('This product is still in a cart or an order');
  }
  throw error;
}
