import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Prisma, ReviewStatus } from '@prisma/client';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { ResponseEnvelope } from '../common/response/api-response.types';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { ModerationQueryDto } from './dto/moderation-query.dto';
import { ReviewStatusDto } from './dto/review-status.dto';

const publicReviewSelect = {
  id: true,
  companyId: true,
  title: true,
  reviewType: true,
  experienceType: true,
  position: true,
  content: true,
  advantage: true,
  disadvantage: true,
  salary: true,
  salaryInfo: true,
  interviewDifficulty: true,
  workExperience: true,
  workEnvironmentScore: true,
  managementScore: true,
  salaryBenefitScore: true,
  growthScore: true,
  rating: true,
  status: true,
  likeCount: true,
  commentCount: true,
  publishedAt: true,
  createdAt: true,
} satisfies Prisma.ReviewSelect;

type PublicReview = Prisma.ReviewGetPayload<{ select: typeof publicReviewSelect }>;

@Injectable()
export class ReviewService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, userId: string, dto: CreateReviewDto): Promise<PublicReview> {
    await this.ensureCompany(companyId);
    const rating =
      (dto.workEnvironmentScore + dto.managementScore + dto.salaryBenefitScore + dto.growthScore) /
      4;

    try {
      return await this.prisma.review.create({
        data: {
          companyId,
          userId,
          title: dto.title,
          reviewType: dto.reviewType,
          experienceType: dto.experienceType,
          position: dto.position,
          content: dto.content,
          advantage: dto.advantage,
          disadvantage: dto.disadvantage,
          salary: dto.salary,
          salaryInfo: dto.salaryInfo,
          interviewDifficulty: dto.interviewDifficulty,
          workExperience: dto.workExperience,
          workEnvironmentScore: dto.workEnvironmentScore,
          managementScore: dto.managementScore,
          salaryBenefitScore: dto.salaryBenefitScore,
          growthScore: dto.growthScore,
          rating,
          isAnonymous: true,
          status: ReviewStatus.PENDING,
        },
        select: publicReviewSelect,
      });
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException({
          code: 'DUPLICATE_COMPANY_REVIEW',
          message: '每位用户只能评价同一企业一次',
          details: { companyId },
        });
      }
      throw error;
    }
  }

  async findApproved(
    companyId: string,
    query: PaginationQueryDto,
  ): Promise<ResponseEnvelope<PublicReview[]>> {
    await this.ensureCompany(companyId);
    const where: Prisma.ReviewWhereInput = {
      companyId,
      status: ReviewStatus.APPROVED,
      deletedAt: null,
    };
    const [reviews, total] = await this.prisma.$transaction([
      this.prisma.review.findMany({
        where,
        select: publicReviewSelect,
        orderBy: [{ likeCount: 'desc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.review.count({ where }),
    ]);

    return {
      data: reviews,
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        hasMore: query.page * query.pageSize < total,
      },
    };
  }

  async moderate(id: string, dto: ReviewStatusDto): Promise<PublicReview> {
    const existing = await this.prisma.review.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, companyId: true, status: true },
    });
    if (!existing) {
      throw this.reviewNotFound();
    }
    if (existing.status !== ReviewStatus.PENDING) {
      throw new UnprocessableEntityException({
        code: 'REVIEW_ALREADY_MODERATED',
        message: '该评价已经完成审核',
        details: { status: existing.status },
      });
    }

    return this.prisma.$transaction(async (tx) => {
      const update = await tx.review.updateMany({
        where: { id, status: ReviewStatus.PENDING, deletedAt: null },
        data: {
          status: dto.status,
          publishedAt: dto.status === ReviewStatus.APPROVED ? new Date() : null,
        },
      });
      if (update.count !== 1) {
        throw new UnprocessableEntityException({
          code: 'REVIEW_ALREADY_MODERATED',
          message: '该评价已被其他管理员审核',
          details: {},
        });
      }
      const review = await tx.review.findUniqueOrThrow({
        where: { id },
        select: publicReviewSelect,
      });
      await this.refreshCompanyStatistics(tx, existing.companyId);
      return review;
    });
  }

  async findForModeration(query: ModerationQueryDto) {
    const where: Prisma.ReviewWhereInput = {
      status: query.status,
      deletedAt: null,
    };
    const [reviews, total] = await this.prisma.$transaction([
      this.prisma.review.findMany({
        where,
        select: {
          ...publicReviewSelect,
          userId: true,
          author: { select: { nickname: true } },
          company: { select: { displayName: true } },
        },
        orderBy: { createdAt: 'asc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.review.count({ where }),
    ]);
    return {
      data: reviews,
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        hasMore: query.page * query.pageSize < total,
      },
    };
  }

  async like(reviewId: string, userId: string): Promise<{ liked: true; likeCount: number }> {
    await this.ensureApprovedReview(reviewId);
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        await tx.like.create({ data: { reviewId, userId } });
        return tx.review.update({
          where: { id: reviewId },
          data: { likeCount: { increment: 1 } },
          select: { likeCount: true },
        });
      });
      return { liked: true, likeCount: result.likeCount };
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException({
          code: 'REVIEW_ALREADY_LIKED',
          message: '不能重复点赞同一评价',
          details: { reviewId },
        });
      }
      throw error;
    }
  }

  async unlike(reviewId: string, userId: string): Promise<{ liked: false; likeCount: number }> {
    const like = await this.prisma.like.findFirst({ where: { reviewId, userId } });
    if (!like) {
      throw new NotFoundException({
        code: 'REVIEW_LIKE_NOT_FOUND',
        message: '尚未点赞该评价',
        details: { reviewId },
      });
    }

    const result = await this.prisma.$transaction(async (tx) => {
      await tx.like.delete({ where: { id: like.id } });
      return tx.review.update({
        where: { id: reviewId },
        data: { likeCount: { decrement: 1 } },
        select: { likeCount: true },
      });
    });
    return { liked: false, likeCount: Math.max(0, result.likeCount) };
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

  private async ensureApprovedReview(reviewId: string): Promise<void> {
    const review = await this.prisma.review.findFirst({
      where: { id: reviewId, status: ReviewStatus.APPROVED, deletedAt: null },
      select: { id: true },
    });
    if (!review) {
      throw this.reviewNotFound();
    }
  }

  private async refreshCompanyStatistics(
    tx: Prisma.TransactionClient,
    companyId: string,
  ): Promise<void> {
    const statistics = await tx.review.aggregate({
      where: { companyId, status: ReviewStatus.APPROVED, deletedAt: null },
      _count: { id: true },
      _avg: {
        rating: true,
        workEnvironmentScore: true,
        managementScore: true,
        salaryBenefitScore: true,
        growthScore: true,
      },
    });
    await tx.company.update({
      where: { id: companyId },
      data: {
        reviewCount: statistics._count.id,
        ratingAverage: statistics._avg.rating ?? 0,
        workScoreAverage: statistics._avg.workEnvironmentScore ?? 0,
        managementScoreAverage: statistics._avg.managementScore ?? 0,
        benefitsScoreAverage: statistics._avg.salaryBenefitScore ?? 0,
        growthScoreAverage: statistics._avg.growthScore ?? 0,
        ratingUpdatedAt: new Date(),
      },
    });
  }

  private reviewNotFound(): NotFoundException {
    return new NotFoundException({
      code: 'REVIEW_NOT_FOUND',
      message: '评价不存在或尚未通过审核',
      details: {},
    });
  }

  private isUniqueViolation(error: unknown): boolean {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
  }
}
