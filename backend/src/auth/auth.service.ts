import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma, User, UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import type { AuthResponse, AuthUser, JwtPayload } from './auth.types';

const BCRYPT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const email = dto.email?.trim().toLowerCase();
    const phone = dto.phone?.trim();

    if ((!email && !phone) || (email && phone)) {
      throw new BadRequestException({
        code: 'REGISTRATION_IDENTIFIER_REQUIRED',
        message: '必须且只能提供邮箱或手机号其中一项',
        details: {},
      });
    }

    const nickname = dto.nickname.trim();
    if (!nickname) {
      throw new BadRequestException({
        code: 'INVALID_NICKNAME',
        message: '用户昵称不能为空',
        details: {},
      });
    }

    if (Buffer.byteLength(dto.password, 'utf8') > 72) {
      throw new BadRequestException({
        code: 'PASSWORD_TOO_LONG',
        message: '密码的 UTF-8 编码不能超过 72 字节',
        details: {},
      });
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    try {
      const user = await this.prisma.user.create({
        data: {
          email,
          phone,
          passwordHash,
          nickname,
          role: dto.role ?? UserRole.USER,
        },
      });

      return this.createAuthResponse(user);
    } catch (error: unknown) {
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException({
          code: 'USER_ALREADY_EXISTS',
          message: '该邮箱或手机号已注册',
          details: {},
        });
      }
      throw error;
    }
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const identifier = dto.identifier.trim();
    const normalizedIdentifier = identifier.includes('@') ? identifier.toLowerCase() : identifier;
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: normalizedIdentifier }, { phone: normalizedIdentifier }],
        deletedAt: null,
      },
    });

    if (
      !user?.passwordHash ||
      user.status !== UserStatus.ACTIVE ||
      !(await bcrypt.compare(dto.password, user.passwordHash))
    ) {
      throw new UnauthorizedException({
        code: 'INVALID_CREDENTIALS',
        message: '邮箱、手机号或密码错误',
        details: {},
      });
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return this.createAuthResponse(user);
  }

  private async createAuthResponse(user: User): Promise<AuthResponse> {
    const payload: JwtPayload = {
      sub: user.id,
      role: user.role,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: this.toAuthUser(user),
    };
  }

  private toAuthUser(user: User): AuthUser {
    return {
      id: user.id,
      nickname: user.nickname,
      role: user.role,
    };
  }

  private isUniqueConstraintError(error: unknown): boolean {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
  }
}
