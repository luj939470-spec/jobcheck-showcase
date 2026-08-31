import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { AuthenticatedRequest, JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { IdParamDto } from '../common/dto/id-param.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { ModerationQueryDto } from './dto/moderation-query.dto';
import { ReviewStatusDto } from './dto/review-status.dto';
import { ReviewService } from './review.service';

@ApiTags('company reviews')
@Controller('companies')
export class CompanyReviewsController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post(':id/reviews')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  create(
    @Param() params: IdParamDto,
    @Body() dto: CreateReviewDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.reviewService.create(params.id, request.user.id, dto);
  }

  @Get(':id/reviews')
  findApproved(@Param() params: IdParamDto, @Query() query: PaginationQueryDto) {
    return this.reviewService.findApproved(params.id, query);
  }
}

@ApiTags('reviews')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get('moderation')
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @UseGuards(RolesGuard)
  findForModeration(@Query() query: ModerationQueryDto) {
    return this.reviewService.findForModeration(query);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @UseGuards(RolesGuard)
  moderate(@Param() params: IdParamDto, @Body() dto: ReviewStatusDto) {
    return this.reviewService.moderate(params.id, dto);
  }

  @Post(':id/like')
  @ApiOkResponse({ description: '点赞评价' })
  like(@Param() params: IdParamDto, @Req() request: AuthenticatedRequest) {
    return this.reviewService.like(params.id, request.user.id);
  }

  @Delete(':id/like')
  @ApiOkResponse({ description: '取消点赞评价' })
  unlike(@Param() params: IdParamDto, @Req() request: AuthenticatedRequest) {
    return this.reviewService.unlike(params.id, request.user.id);
  }
}
