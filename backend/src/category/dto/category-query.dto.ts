import { ApiPropertyOptional } from '@nestjs/swagger';
import { CategoryStatus, CategoryType } from '@prisma/client';
import { IsEnum, IsIn, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class CategoryQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: CategoryType })
  @IsOptional()
  @IsIn([
    CategoryType.RECOMMEND,
    CategoryType.INTERNET,
    CategoryType.LIFE_SERVICE,
    CategoryType.AI,
    CategoryType.SMART_HARDWARE,
  ])
  type?: CategoryType;

  @ApiPropertyOptional({ enum: CategoryStatus, default: CategoryStatus.ACTIVE })
  @IsOptional()
  @IsEnum(CategoryStatus)
  status: CategoryStatus = CategoryStatus.ACTIVE;
}
