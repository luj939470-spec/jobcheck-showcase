import { Injectable } from '@nestjs/common';
import { CategoryType, Prisma } from '@prisma/client';
import { ResponseEnvelope } from '../common/response/api-response.types';
import { PrismaService } from '../prisma/prisma.service';
import { CategoryQueryDto } from './dto/category-query.dto';

const HOME_CATEGORY_TYPES = [
  CategoryType.RECOMMEND,
  CategoryType.INTERNET,
  CategoryType.LIFE_SERVICE,
  CategoryType.AI,
  CategoryType.SMART_HARDWARE,
] as const;

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: CategoryQueryDto): Promise<ResponseEnvelope<unknown[]>> {
    const where: Prisma.CategoryWhereInput = {
      type: query.type ?? { in: [...HOME_CATEGORY_TYPES] },
      status: query.status,
      deletedAt: null,
    };
    const [categories, total] = await this.prisma.$transaction([
      this.prisma.category.findMany({
        where,
        select: {
          id: true,
          name: true,
          type: true,
          description: true,
          icon: true,
          sort: true,
          status: true,
          createdAt: true,
        },
        orderBy: [{ sort: 'asc' }, { createdAt: 'asc' }],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.category.count({ where }),
    ]);

    return {
      data: categories,
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        hasMore: query.page * query.pageSize < total,
      },
    };
  }
}
