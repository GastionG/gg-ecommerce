import { IsNumber, Min } from 'class-validator';

export class AddCartItemDto {
  @IsNumber()
  productId: number;

  @Min(1)
  @IsNumber()
  quantity: number;
}
