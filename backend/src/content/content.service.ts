import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CategoryStatus,
  CategoryType,
  ContentStatus,
  Prisma,
} from '@prisma/client';
import { ResponseEnvelope } from '../common/response/api-response.types';
import { PrismaService } from '../prisma/prisma.service';
import { ContentQueryDto } from './dto/content-query.dto';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';

const CONTENT_CATEGORY_TYPES = [
  CategoryType.INTERNET,
  CategoryType.LIFE_SERVICE,
] as const;
const CONTENT_CATEGORY_TYPE_SET = new Set<CategoryType>(CONTENT_CATEGORY_TYPES);

const contentSelect = {
  id: true,
  categoryId: true,
  title: true,
  description: true,
  cover: true,
  url: true,
  source: true,
  viewCount: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  category: {
    select: { id: true, name: true, type: true, icon: true },
  },
} satisfies Prisma.ContentSelect;

@Injectable()
export class ContentService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ContentQueryDto): Promise<ResponseEnvelope<unknown[]>> {
    if (query.category && !CONTENT_CATEGORY_TYPE_SET.has(query.category)) {
      throw new BadRequestException({
        code: 'INVALID_CONTENT_CATEGORY',
        message: '内容分类仅支持 INTERNET 或 LIFE_SERVICE',
        details: { category: query.category },
      });
    }
    const where: Prisma.ContentWhereInput = {
      status: ContentStatus.PUBLISHED,
      deletedAt: null,
      category: {
        type: query.category ?? { in: [...CONTENT_CATEGORY_TYPES] },
        status: CategoryStatus.ACTIVE,
        deletedAt: null,
      },
    };
    const [contents, total] = await this.prisma.$transaction([
      this.prisma.content.findMany({
        where,
        select: contentSelect,
        orderBy: [{ viewCount: 'desc' }, { createdAt: 'desc' }],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.content.count({ where }),
    ]);
    return {
      data: contents,
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        hasMore: query.page * query.pageSize < total,
      },
    };
  }

  async findOne(id: string) {
    const content = await this.prisma.content.findFirst({
      where: { id, status: ContentStatus.PUBLISHED, deletedAt: null },
      select: { id: true },
    });
    if (!content) throw this.notFound(id);

    return this.prisma.content.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
      select: contentSelect,
    });
  }

  async create(dto: CreateContentDto) {
    await this.ensureContentCategory(dto.categoryId);
    return this.prisma.content.create({
      data: {
        categoryId: dto.categoryId,
        title: dto.title.trim(),
        description: dto.description?.trim(),
        cover: dto.cover,
        url: dto.url,
        source: dto.source?.trim(),
        status: dto.status,
      },
      select: contentSelect,
    });
  }

  async update(id: string, dto: UpdateContentDto) {
    await this.ensureExists(id);
    if (dto.categoryId) await this.ensureContentCategory(dto.categoryId);

    return this.prisma.content.update({
      where: { id },
      data: {
        categoryId: dto.categoryId,
        title: dto.title?.trim(),
        description: dto.description?.trim(),
        cover: dto.cover,
        url: dto.url,
        source: dto.source?.trim(),
        status: dto.status,
      },
      select: contentSelect,
    });
  }

  async remove(id: string): Promise<{ deleted: true }> {
    await this.ensureExists(id);
    await this.prisma.content.update({
      where: { id },
      data: { deletedAt: new Date(), status: ContentStatus.ARCHIVED },
    });
    return { deleted: true };
  }

  private async ensureContentCategory(categoryId: string): Promise<void> {
    const category = await this.prisma.category.findFirst({
      where: {
        id: categoryId,
        type: { in: [...CONTENT_CATEGORY_TYPES] },
        status: CategoryStatus.ACTIVE,
        deletedAt: null,
      },
      select: { id: true },
    });
    if (!category) {
      throw new BadRequestException({
        code: 'INVALID_CONTENT_CATEGORY',
        message: '内容必须属于启用中的互联网或生活服务分类',
        details: { categoryId },
      });
    }
  }

  private async ensureExists(id: string): Promise<void> {
    const content = await this.prisma.content.findFirst({
      where: { id, deletedAt: null },
      select: { id: true },
    });
    if (!content) throw this.notFound(id);
  }

  private notFound(id: string): NotFoundException {
    return new NotFoundException({
      code: 'CONTENT_NOT_FOUND',
      message: '内容不存在',
      details: { id },
    });
  }
}
