import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { RecommendService } from './recommend.service';

@ApiTags('recommend')
@Controller('recommend')
export class RecommendController {
  constructor(private readonly recommendService: RecommendService) {}

  @Get()
  @ApiOkResponse({ description: '分页获取首页热门企业、评价、内容和 AI 入口' })
  getHomepage(@Query() query: PaginationQueryDto) {
    return this.recommendService.getHomepage(query);
  }
}
