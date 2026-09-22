import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Cart } from '@gg/shared';
import { AddCartItemDto } from './dto/add-cart-item.dto.js';
import { UpdateCartItemDto } from './dto/update-cart-item.dto.js';
import { DefaultModelRow } from '@prisma/orm-postgres/orm-client';
import { Contract } from '../prisma/contract.js';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) { }

  async getCart(userId: number) {
    const row = await this.prisma.client.orm.public.Cart
      .where({ userId })
      .first();

    if (!row) {
      throw new NotFoundException('Cart not found');
    }

    const items = await this.prisma.client.orm.public.CartItem
      .where({ cartId: row?.id })
      .include('product')
      .all();


    return toCartDto(row, items);
  }

  async addItem(userId: number, dto: AddCartItemDto) {
    const cart = await this.getCart(userId);

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const item = await this.prisma.client.orm.public.CartItem.create({
      cartId: cart.id,
      productId: dto.productId,
      quantity: dto.quantity,
    });

    return toCartDto(cart, [...cart.items, item]);
  }

  // updateItem(userId: number, itemId: number, dto: UpdateCartItemDto): Promise<Cart>
  // removeItem(userId: number, itemId: number): Promise<Cart>
}

function toCartDto(row: DefaultModelRow<Contract, "Cart", "public">, items: DefaultModelRow<Contract, "CartItem", "public">[]) {

  if (typeof row.id !== 'number' || !Array.isArray(items)) {
    throw new Error('Cart is missing id/items/subtotalCents');
  }

  const subtotalCents = items.reduce((acc, item) => acc + (item.product?.priceCents ?? 0) * (item.quantity ?? 0), 0);

  return {
    id: row.id,
    items: items.map(toCartItemDto),
    subtotalCents,
  };
}


function toCartItemDto(item: { [key: string]: unknown }) {
  const productId = item.productId;
  const quantity = item.quantity;
  if (typeof productId !== 'number' || typeof quantity !== 'number') {
    throw new Error('Cart item is missing productId/quantity');
  }
  return { productId, quantity };
}