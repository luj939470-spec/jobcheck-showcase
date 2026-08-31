import { ApiPropertyOptional } from '@nestjs/swagger';
import { CategoryType } from '@prisma/client';
import { IsIn, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class ContentQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    enum: [CategoryType.INTERNET, CategoryType.LIFE_SERVICE],
    example: CategoryType.INTERNET,
  })
  @IsOptional()
  @IsIn([CategoryType.INTERNET, CategoryType.LIFE_SERVICE])
  category?: CategoryType;
}
