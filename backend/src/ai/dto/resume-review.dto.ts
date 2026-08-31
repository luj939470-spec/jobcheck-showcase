import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class ResumeReviewDto {
  @ApiProperty({ description: '纯文本简历内容' })
  @IsString()
  @MinLength(50)
  @MaxLength(30000)
  resumeText!: string;
}
