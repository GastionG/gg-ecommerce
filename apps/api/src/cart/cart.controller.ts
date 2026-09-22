import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { AddCartItemDto } from './dto/add-cart-item.dto.js';
import { UpdateCartItemDto } from './dto/update-cart-item.dto.js';
import type { AuthUser } from '@gg/shared';
import { CartService } from './cart.service.js';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) { }

  @Get()
  getCart(@CurrentUser() user: AuthUser) {
    return this.cartService.getCart(user.id);
  }

  @Post('items')
  addItem(@CurrentUser() user: AuthUser, @Body() dto: AddCartItemDto) {
    return this.cartService.addItem(user.id, dto);
  }

  // @Patch('items/:id')
  // updateItem(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateCartItemDto) {
  //   return this.cartService.updateItem(user.id, Number(id), dto);
  // }

  // @Delete('items/:id')
  // removeItem(@CurrentUser() user: AuthUser, @Param('id') id: string) {
  //   return this.cartService.removeItem(user.id, Number(id));
  // }
}