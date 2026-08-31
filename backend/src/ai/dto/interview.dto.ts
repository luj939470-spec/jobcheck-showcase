import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export enum InterviewAction {
  GENERATE = 'generate',
  EVALUATE = 'evaluate',
}

export class InterviewDto {
  @ApiProperty({ enum: InterviewAction })
  @IsEnum(InterviewAction)
  action!: InterviewAction;

  @ApiPropertyOptional({ example: 'Java 后端工程师' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  position?: string;

  @ApiPropertyOptional({ example: '中级' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  level?: string;

  @ApiPropertyOptional({ minimum: 1, maximum: 10, default: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  questionCount?: number;

  @ApiPropertyOptional({ description: 'evaluate 时传入面试题' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  question?: string;

  @ApiPropertyOptional({ description: 'evaluate 时传入用户回答' })
  @IsOptional()
  @IsString()
  @MaxLength(10000)
  answer?: string;
}
