import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CategoryService } from './category.service';
import { CategoryQueryDto } from './dto/category-query.dto';

@ApiTags('categories')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @ApiOkResponse({ description: '分页获取首页业务分类' })
  findAll(@Query() query: CategoryQueryDto) {
    return this.categoryService.findAll(query);
  }
}
