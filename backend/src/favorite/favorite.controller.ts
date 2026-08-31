import { Controller, Delete, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthenticatedRequest, JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IdParamDto } from '../common/dto/id-param.dto';
import { FavoriteService } from './favorite.service';

@ApiTags('company favorites')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('companies')
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  @Post(':id/favorite')
  add(@Param() params: IdParamDto, @Req() request: AuthenticatedRequest) {
    return this.favoriteService.add(params.id, request.user.id);
  }

  @Delete(':id/favorite')
  remove(@Param() params: IdParamDto, @Req() request: AuthenticatedRequest) {
    return this.favoriteService.remove(params.id, request.user.id);
  }
}
