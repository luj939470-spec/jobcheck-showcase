import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { IdParamDto } from '../common/dto/id-param.dto';
import { CompanyQueryDto } from './dto/company-query.dto';
import { CompanyService } from './company.service';

@ApiTags('companies')
@Controller('companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get()
  @ApiOkResponse({ description: 'Paginated company list' })
  findAll(@Query() query: CompanyQueryDto) {
    return this.companyService.findAll(query);
  }

  @Get(':id/statistics')
  @ApiOkResponse({ description: '企业已审核评价的评分统计' })
  getStatistics(@Param() params: IdParamDto) {
    return this.companyService.getStatistics(params.id);
  }

  @Get(':id')
  @ApiOkResponse({ description: '企业详情、评价数量和平均评分' })
  getDetail(@Param() params: IdParamDto) {
    return this.companyService.getDetail(params.id);
  }
}
