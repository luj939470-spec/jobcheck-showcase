import { ApiProperty } from '@nestjs/swagger';
import { ReviewStatus } from '@prisma/client';
import { IsIn } from 'class-validator';

const moderationStatuses = [ReviewStatus.APPROVED, ReviewStatus.REJECTED] as const;

export class ReviewStatusDto {
  @ApiProperty({ enum: moderationStatuses })
  @IsIn(moderationStatuses)
  status!: (typeof moderationStatuses)[number];
}
