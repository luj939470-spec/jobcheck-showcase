import { UserRole } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

const selfRegisterRoles = [UserRole.USER, UserRole.COMPANY_EMPLOYEE] as const;

export class RegisterDto {
  @ApiPropertyOptional({ example: 'user@example.com', maxLength: 320 })
  @ValidateIf((value: RegisterDto) => value.email !== undefined)
  @IsString()
  @IsEmail()
  @MaxLength(320)
  email?: string;

  @ApiPropertyOptional({
    example: '+8613800138000',
    description: '国际格式手机号，可省略开头的 +',
  })
  @ValidateIf((value: RegisterDto) => value.phone !== undefined)
  @IsString()
  @Matches(/^\+?[1-9]\d{6,14}$/, {
    message: 'phone must be a valid phone number',
  })
  phone?: string;

  @ApiProperty({ minLength: 8, maxLength: 72, writeOnly: true })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;

  @ApiProperty({ example: '小明', minLength: 1, maxLength: 80 })
  @IsString()
  @Length(1, 80)
  nickname!: string;

  @ApiPropertyOptional({
    enum: selfRegisterRoles,
    default: UserRole.USER,
    description: '公开注册仅允许普通用户或企业员工；管理员账号需由后台创建',
  })
  @IsOptional()
  @IsIn(selfRegisterRoles)
  role?: (typeof selfRegisterRoles)[number];
}
