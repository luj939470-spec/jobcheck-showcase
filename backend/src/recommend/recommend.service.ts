import { Injectable } from '@nestjs/common';
import {
  ContentStatus,
  RecommendationStatus,
  RecommendationType,
  ReviewStatus,
} from '@prisma/client';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RecommendService {
  constructor(private readonly prisma: PrismaService) {}

  async getHomepage(query: PaginationQueryDto) {
    const skip = (query.page - 1) * query.pageSize;
    const [
      popularCompanies,
      companyTotal,
      popularReviews,
      reviewTotal,
      popularContents,
      contentTotal,
      aiRecommendation,
    ] = await this.prisma.$transaction([
      this.prisma.company.findMany({
        where: { deletedAt: null },
        select: {
          id: true,
          displayName: true,
          logoUrl: true,
          cityCode: true,
          reviewCount: true,
          ratingAverage: true,
          verificationStatus: true,
        },
        orderBy: [
          { reviewCount: 'desc' },
          { ratingAverage: 'desc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: query.pageSize,
      }),
      this.prisma.company.count({ where: { deletedAt: null } }),
      this.prisma.review.findMany({
        where: {
          status: ReviewStatus.APPROVED,
          deletedAt: null,
          company: { deletedAt: null },
        },
        select: {
          id: true,
          companyId: true,
          title: true,
          content: true,
          rating: true,
          likeCount: true,
          commentCount: true,
          publishedAt: true,
          createdAt: true,
          company: { select: { displayName: true, logoUrl: true } },
        },
        orderBy: [
          { likeCount: 'desc' },
          { commentCount: 'desc' },
          { publishedAt: 'desc' },
        ],
        skip,
        take: query.pageSize,
      }),
      this.prisma.review.count({
        where: {
          status: ReviewStatus.APPROVED,
          deletedAt: null,
          company: { deletedAt: null },
        },
      }),
      this.prisma.content.findMany({
        where: {
          status: ContentStatus.PUBLISHED,
          deletedAt: null,
          category: { deletedAt: null },
        },
        select: {
          id: true,
          categoryId: true,
          title: true,
          description: true,
          cover: true,
          url: true,
          source: true,
          viewCount: true,
          createdAt: true,
          category: { select: { name: true, type: true, icon: true } },
        },
        orderBy: [{ viewCount: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: query.pageSize,
      }),
      this.prisma.content.count({
        where: { status: ContentStatus.PUBLISHED, deletedAt: null },
      }),
      this.prisma.recommendation.findFirst({
        where: {
          type: RecommendationType.AI_ENTRY,
          status: RecommendationStatus.ACTIVE,
        },
        select: {
          id: true,
          title: true,
          description: true,
          icon: true,
          url: true,
        },
        orderBy: [{ sort: 'asc' }, { createdAt: 'desc' }],
      }),
    ]);

    const total = Math.max(companyTotal, reviewTotal, contentTotal);
    return {
      data: {
        popularCompanies: popularCompanies.map(({ ratingAverage, ...company }) => ({
          ...company,
          name: company.displayName,
          logo: company.logoUrl,
          city: company.cityCode,
          averageScore: Number(ratingAverage),
        })),
        popularReviews: popularReviews.map((review) => ({
          ...review,
          rating: Number(review.rating),
        })),
        popularContents,
        aiEntry: aiRecommendation ?? {
          id: 'ai-assistant',
          title: 'AI 智能助手',
          description: '企业分析、简历优化与模拟面试',
          icon: 'sparkles',
          url: '/ai',
        },
      },
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        hasMore: query.page * query.pageSize < total,
        totals: {
          companies: companyTotal,
          reviews: reviewTotal,
          contents: contentTotal,
        },
      },
    };
  }
}
