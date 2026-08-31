import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AuthenticatedRequest, JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserProfile, UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOkResponse({ description: '当前登录用户资料' })
  @ApiUnauthorizedResponse({ description: '访问令牌无效或已过期' })
  getProfile(@Req() request: AuthenticatedRequest): Promise<UserProfile> {
    return this.usersService.getProfile(request.user.id);
  }
}
