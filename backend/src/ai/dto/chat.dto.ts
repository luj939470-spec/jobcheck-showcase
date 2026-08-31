import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class ChatDto {
  @ApiProperty({ example: '帮我分析一下互联网行业未来三年的发展趋势' })
  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  message!: string;

  @ApiPropertyOptional({ format: 'uuid', description: '不传时自动创建新会话' })
  @IsOptional()
  @IsUUID()
  conversationId?: string;
}
