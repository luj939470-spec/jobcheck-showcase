import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthenticatedRequest, JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IdParamDto } from '../common/dto/id-param.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@ApiTags('review comments')
@Controller('reviews')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post(':id/comments')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  create(
    @Param() params: IdParamDto,
    @Body() dto: CreateCommentDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.commentService.create(params.id, request.user.id, dto);
  }

  @Get(':id/comments')
  findAll(@Param() params: IdParamDto, @Query() query: PaginationQueryDto) {
    return this.commentService.findAll(params.id, query);
  }
}
