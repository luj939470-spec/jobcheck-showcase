import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class CompanyQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Search by company name' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;

  @ApiPropertyOptional({ description: 'Industry category id' })
  @IsOptional()
  @IsUUID()
  industryId?: string;
}
