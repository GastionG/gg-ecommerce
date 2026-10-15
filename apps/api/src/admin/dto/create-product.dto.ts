import { IsInt, IsString, IsUrl, Matches, Min, MinLength } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  slug: string;

  @IsString()
  @MinLength(1)
  description: string;

  @IsInt()
  @Min(0)
  priceCents: number;

  @IsUrl({ require_protocol: true })
  imageUrl: string;

  @IsInt()
  @Min(0)
  stock: number;

  @IsString()
  @MinLength(1)
  categorySlug: string;
}
