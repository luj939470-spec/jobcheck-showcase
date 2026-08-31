import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ExperienceType, ReviewType } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsString, Length, Max, Min } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({ minLength: 2, maxLength: 160 })
  @IsString()
  @Length(2, 160)
  title!: string;

  @ApiProperty({ enum: ReviewType, example: ReviewType.INTERNSHIP })
  @IsEnum(ReviewType)
  reviewType!: ReviewType;

  @ApiProperty({ enum: ExperienceType, example: ExperienceType.INTERN })
  @IsEnum(ExperienceType)
  experienceType!: ExperienceType;

  @ApiProperty({ minLength: 20, maxLength: 10000 })
  @IsString()
  @Length(20, 10000)
  content!: string;

  @ApiPropertyOptional({ maxLength: 100 })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  position?: string;

  @ApiPropertyOptional({ maxLength: 3000 })
  @IsOptional()
  @IsString()
  @Length(1, 3000)
  advantage?: string;

  @ApiPropertyOptional({ maxLength: 3000 })
  @IsOptional()
  @IsString()
  @Length(1, 3000)
  disadvantage?: string;

  @ApiPropertyOptional({ description: '税前月薪，单位：元', minimum: 0, maximum: 1000000 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1000000)
  salary?: number;

  @ApiPropertyOptional({ maxLength: 500 })
  @IsOptional()
  @IsString()
  @Length(1, 500)
  salaryInfo?: string;

  @ApiPropertyOptional({ maxLength: 1000 })
  @IsOptional()
  @IsString()
  @Length(1, 1000)
  workExperience?: string;

  @ApiPropertyOptional({ description: '面试难度，1-5', minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  interviewDifficulty?: number;

  @ApiProperty({ minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  workEnvironmentScore!: number;

  @ApiProperty({ minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  managementScore!: number;

  @ApiProperty({ minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  salaryBenefitScore!: number;

  @ApiProperty({ minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  growthScore!: number;
}
