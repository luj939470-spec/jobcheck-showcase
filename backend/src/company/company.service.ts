import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoryType, Prisma } from '@prisma/client';
import { ResponseEnvelope } from '../common/response/api-response.types';
import { PrismaService } from '../prisma/prisma.service';
import { CompanyQueryDto } from './dto/company-query.dto';

@Injectable()
export class CompanyService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: CompanyQueryDto): Promise<ResponseEnvelope<unknown[]>> {
    const search = query.search?.trim();
    const where: Prisma.CompanyWhereInput = {
      deletedAt: null,
      ...(search
        ? {
            OR: [
              { displayName: { contains: search, mode: 'insensitive' } },
              { shortName: { contains: search, mode: 'insensitive' } },
              { legalName: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(query.industryId
        ? {
            categories: {
              some: {
                categoryId: query.industryId,
                category: { type: CategoryType.INDUSTRY, deletedAt: null },
              },
            },
          }
        : {}),
    };
    const select = {
      id: true,
      displayName: true,
      logoUrl: true,
      cityCode: true,
      reviewCount: true,
      ratingAverage: true,
      verificationStatus: true,
      categories: {
        where: {
          isPrimary: true,
          category: { type: CategoryType.INDUSTRY, deletedAt: null },
        },
        select: { category: { select: { id: true, code: true, name: true } } },
        take: 1,
      },
    } satisfies Prisma.CompanySelect;

    const [companies, total] = await this.prisma.$transaction([
      this.prisma.company.findMany({
        where,
        select,
        orderBy: [{ ratingAverage: 'desc' }, { reviewCount: 'desc' }, { displayName: 'asc' }],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.company.count({ where }),
    ]);

    return {
      data: companies.map(({ categories, ratingAverage, ...company }) => ({
        ...company,
        name: company.displayName,
        logo: company.logoUrl,
        city: company.cityCode,
        averageScore: Number(ratingAverage),
        industry: categories[0]?.category ?? null,
      })),
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        hasMore: query.page * query.pageSize < total,
      },
    };
  }

  async getDetail(id: string) {
    const company = await this.prisma.company.findFirst({
      where: { id, deletedAt: null },
      select: {
        id: true,
        legalName: true,
        displayName: true,
        logoUrl: true,
        description: true,
        registeredAddress: true,
        website: true,
        cityCode: true,
        companySizeCode: true,
        financingStageCode: true,
        tags: true,
        verificationStatus: true,
        createdAt: true,
        reviewCount: true,
        ratingAverage: true,
        categories: {
          where: {
            isPrimary: true,
            category: { type: CategoryType.INDUSTRY, deletedAt: null },
          },
          select: { category: { select: { id: true, code: true, name: true } } },
          take: 1,
        },
      },
    });

    if (!company) {
      throw this.notFound();
    }

    const { categories, ...data } = company;
    return {
      ...data,
      name: data.displayName,
      logo: data.logoUrl,
      city: data.cityCode,
      companySize: data.companySizeCode,
      address: data.registeredAddress,
      financingInfo: data.financingStageCode,
      averageScore: Number(data.ratingAverage),
      industry: categories[0]?.category ?? null,
    };
  }

  async getStatistics(id: string) {
    const company = await this.prisma.company.findFirst({
      where: { id, deletedAt: null },
      select: {
        id: true,
        reviewCount: true,
        ratingAverage: true,
        workScoreAverage: true,
        managementScoreAverage: true,
        benefitsScoreAverage: true,
        growthScoreAverage: true,
        ratingUpdatedAt: true,
      },
    });

    if (!company) {
      throw this.notFound();
    }

    const [salary, interviewDifficulty, internshipCount, interviewCount, workCount] =
      await this.prisma.$transaction([
      this.prisma.review.aggregate({
        where: {
          companyId: id,
          status: 'APPROVED',
          deletedAt: null,
          salary: { not: null, gt: 0 },
        },
        _min: { salary: true },
        _max: { salary: true },
        _avg: { salary: true },
      }),
      this.prisma.review.aggregate({
        where: {
          companyId: id,
          status: 'APPROVED',
          deletedAt: null,
          interviewDifficulty: { not: null },
        },
        _avg: { interviewDifficulty: true },
        _count: { interviewDifficulty: true },
      }),
      this.prisma.review.count({
        where: { companyId: id, reviewType: 'INTERNSHIP', status: 'APPROVED', deletedAt: null },
      }),
      this.prisma.review.count({
        where: { companyId: id, reviewType: 'INTERVIEW', status: 'APPROVED', deletedAt: null },
      }),
      this.prisma.review.count({
        where: { companyId: id, reviewType: 'WORK', status: 'APPROVED', deletedAt: null },
      }),
      ]);

    return {
      companyId: company.id,
      reviewCount: company.reviewCount,
      overallScore: Number(company.ratingAverage),
      workEnvironmentScore: Number(company.workScoreAverage),
      managementScore: Number(company.managementScoreAverage),
      salaryBenefitScore: Number(company.benefitsScoreAverage),
      growthScore: Number(company.growthScoreAverage),
      salaryRange: {
        min: salary._min.salary,
        max: salary._max.salary,
        average: salary._avg.salary ? Math.round(Number(salary._avg.salary)) : null,
      },
      interviewDifficulty: interviewDifficulty._avg.interviewDifficulty
        ? Number(interviewDifficulty._avg.interviewDifficulty.toFixed(1))
        : null,
      interviewReviewCount: interviewDifficulty._count.interviewDifficulty,
      reviewTypeCounts: {
        INTERNSHIP: internshipCount,
        INTERVIEW: interviewCount,
        WORK: workCount,
      },
      updatedAt: company.ratingUpdatedAt,
    };
  }

  private notFound(): NotFoundException {
    return new NotFoundException({
      code: 'COMPANY_NOT_FOUND',
      message: '企业不存在',
      details: {},
    });
  }
}
