import { IsNumber, Min } from 'class-validator';

export class UpdateCartItemDto {
  @Min(1)
  @IsNumber()
  quantity: number;
}