import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { SkipResponseWrapper } from '../common/response/skip-response-wrapper.decorator';

interface HealthResponse {
  status: 'ok';
  service: 'jobcheck-backend';
}

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @SkipResponseWrapper()
  @ApiOkResponse({
    description: '服务健康',
    schema: {
      example: {
        status: 'ok',
        service: 'jobcheck-backend',
      },
    },
  })
  check(): HealthResponse {
    return {
      status: 'ok',
      service: 'jobcheck-backend',
    };
  }
}
