import { Injectable, NotFoundException } from '@nestjs/common';
import { CommentStatus, Prisma, ReviewStatus } from '@prisma/client';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { ResponseEnvelope } from '../common/response/api-response.types';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';

const commentSelect = {
  id: true,
  reviewId: true,
  userId: true,
  content: true,
  createdAt: true,
  author: { select: { nickname: true } },
} satisfies Prisma.CommentSelect;

type ReviewComment = Prisma.CommentGetPayload<{ select: typeof commentSelect }>;

@Injectable()
export class CommentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(reviewId: string, userId: string, dto: CreateCommentDto): Promise<ReviewComment> {
    await this.ensureReview(reviewId);
    return this.prisma.$transaction(async (tx) => {
      const comment = await tx.comment.create({
        data: {
          reviewId,
          userId,
          content: dto.content,
          status: CommentStatus.PUBLISHED,
        },
        select: commentSelect,
      });
      await tx.review.update({
        where: { id: reviewId },
        data: { commentCount: { increment: 1 } },
      });
      return comment;
    });
  }

  async findAll(
    reviewId: string,
    query: PaginationQueryDto,
  ): Promise<ResponseEnvelope<ReviewComment[]>> {
    await this.ensureReview(reviewId);
    const where: Prisma.CommentWhereInput = {
      reviewId,
      status: CommentStatus.PUBLISHED,
      deletedAt: null,
    };
    const [comments, total] = await this.prisma.$transaction([
      this.prisma.comment.findMany({
        where,
        select: commentSelect,
        orderBy: { createdAt: 'asc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.comment.count({ where }),
    ]);
    return {
      data: comments,
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        hasMore: query.page * query.pageSize < total,
      },
    };
  }

  private async ensureReview(reviewId: string): Promise<void> {
    const review = await this.prisma.review.findFirst({
      where: { id: reviewId, status: ReviewStatus.APPROVED, deletedAt: null },
      select: { id: true },
    });
    if (!review) {
      throw new NotFoundException({
        code: 'REVIEW_NOT_FOUND',
        message: '评价不存在或尚未通过审核',
        details: { reviewId },
      });
    }
  }
}
