import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { randomUUID } from 'node:crypto';
import { LoggerModule } from 'nestjs-pino';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { ApiResponseInterceptor } from './interceptors/api-response.interceptor';
import { createValidationPipe } from './validation/validation.pipe';

@Module({
  imports: [
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const environment = configService.getOrThrow<string>('app.environment');

        return {
          pinoHttp: {
            level: configService.getOrThrow<string>('logging.level'),
            genReqId: (request, response) => {
              const header = request.headers['x-request-id'];
              const requestId =
                (Array.isArray(header) ? header[0] : header)?.trim() || randomUUID();
              response.setHeader('X-Request-Id', requestId);
              return requestId;
            },
            customProps: (request) => ({
              requestId: request.id,
            }),
            redact: {
              paths: [
                'req.headers.authorization',
                'req.headers.cookie',
                'res.headers["set-cookie"]',
              ],
              censor: '[REDACTED]',
            },
            transport:
              environment === 'development'
                ? {
                    target: 'pino-pretty',
                    options: {
                      colorize: true,
                      singleLine: true,
                      translateTime: 'SYS:standard',
                    },
                  }
                : undefined,
          },
        };
      },
    }),
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ApiResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_PIPE,
      useFactory: createValidationPipe,
    },
  ],
  exports: [LoggerModule],
})
export class CommonModule {}
