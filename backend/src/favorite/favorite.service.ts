import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavoriteService {
  constructor(private readonly prisma: PrismaService) {}

  async add(companyId: string, userId: string) {
    await this.ensureCompany(companyId);
    try {
      const favorite = await this.prisma.favorite.create({
        data: { companyId, userId },
        select: { id: true, companyId: true, createdAt: true },
      });
      return { favorited: true, favorite };
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException({
          code: 'COMPANY_ALREADY_FAVORITED',
          message: '不能重复收藏同一企业',
          details: { companyId },
        });
      }
      throw error;
    }
  }

  async remove(companyId: string, userId: string) {
    const favorite = await this.prisma.favorite.findFirst({
      where: { companyId, userId },
      select: { id: true },
    });
    if (!favorite) {
      throw new NotFoundException({
        code: 'COMPANY_FAVORITE_NOT_FOUND',
        message: '尚未收藏该企业',
        details: { companyId },
      });
    }

    await this.prisma.favorite.delete({ where: { id: favorite.id } });
    return { favorited: false };
  }

  private async ensureCompany(companyId: string): Promise<void> {
    const company = await this.prisma.company.findFirst({
      where: { id: companyId, deletedAt: null },
      select: { id: true },
    });
    if (!company) {
      throw new NotFoundException({
        code: 'COMPANY_NOT_FOUND',
        message: '企业不存在',
        details: { companyId },
      });
    }
  }

  private isUniqueViolation(error: unknown): boolean {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
  }
}
