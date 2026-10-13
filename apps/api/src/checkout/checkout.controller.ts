import { Controller, Headers, Post, Req, type RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import type { AuthUser, CheckoutSession } from '@gg/shared';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Public } from '../auth/decorators/public.decorator.js';
import { CheckoutService } from './checkout.service.js';

@Controller()
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) { }

  @Post('checkout/session')
  createSession(@CurrentUser() user: AuthUser): Promise<CheckoutSession> {
    return this.checkoutService.createSession(user.id, user.email);
  }

  @Public()
  @Post('webhooks/stripe')
  async stripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature?: string,
  ) {
    const event = this.checkoutService.constructEvent(req.rawBody, signature);
    await this.checkoutService.handleEvent(event);
    return { received: true };
  }
}
