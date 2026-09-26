import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Cart, CartItem } from '@gg/shared';
import { AddCartItemDto } from './dto/add-cart-item.dto.js';
import { UpdateCartItemDto } from './dto/update-cart-item.dto.js';
import { DefaultModelRow } from '@prisma/orm-postgres/orm-client';
import { Contract } from '../prisma/contract.js';
import { ResultType } from '@prisma/orm-postgres/components';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) { }

  async getCartWithItems(userId: number) {
    const row = await this.getOrCreateCart(userId);

    const items = await this.prisma.client.orm.public.CartItem
      .where({ cartId: row.id })
      .include('product')
      .all();

    return { cart: row, items };
  }

  async getOrCreateCart(userId: number) {
    const row = await this.prisma.client.orm.public.Cart
      .where({ userId })
      .first();

    if (!row) {
      return await this.prisma.client.orm.public.Cart
        .create({
          userId,
        })
    }

    return row;
  }

  async addItem(userId: number, dto: AddCartItemDto) {
    const cart = await this.getOrCreateCart(userId);

    const item = await this.prisma.client.orm.public.CartItem.create({
      cartId: cart.id,
      productId: dto.productId,
      quantity: dto.quantity,
    });

    return item;
  }

  async updateItem(userId: number, itemId: number, dto: UpdateCartItemDto) {
    const cart = await this.getOrCreateCart(userId);

    const item = await this.prisma.client.orm.public.CartItem
      .where({ id: itemId, cartId: cart.id });

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    await item.update({
      quantity: dto.quantity,
    });

    return item;
  }

  async removeItem(userId: number, itemId: number) {
    const cart = await this.getOrCreateCart(userId);

    const item = await this.prisma.client.orm.public.CartItem
      .where({ id: itemId, cartId: cart.id });

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    await item.delete();
  }
}
