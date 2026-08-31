import { ApiPropertyOptional } from '@nestjs/swagger';
import { ReviewStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class ModerationQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: ReviewStatus, default: ReviewStatus.PENDING })
  @IsOptional()
  @IsEnum(ReviewStatus)
  status: ReviewStatus = ReviewStatus.PENDING;
}
