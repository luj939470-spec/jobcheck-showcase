import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import type { Request, Response } from 'express';
import { PinoLogger } from 'nestjs-pino';
import { getRequestId, RequestWithId } from '../request/request-id';
import type { ApiErrorResponse } from '../response/api-response.types';

interface ExceptionPayload {
  code?: unknown;
  message?: unknown;
  details?: unknown;
  error?: unknown;
}

const statusCodes: Readonly<Record<number, string>> = {
  [HttpStatus.BAD_REQUEST]: 'BAD_REQUEST',
  [HttpStatus.UNAUTHORIZED]: 'UNAUTHORIZED',
  [HttpStatus.FORBIDDEN]: 'FORBIDDEN',
  [HttpStatus.NOT_FOUND]: 'NOT_FOUND',
  [HttpStatus.CONFLICT]: 'CONFLICT',
  [HttpStatus.UNPROCESSABLE_ENTITY]: 'UNPROCESSABLE_ENTITY',
  [HttpStatus.TOO_MANY_REQUESTS]: 'TOO_MANY_REQUESTS',
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(AllExceptionsFilter.name);
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<RequestWithId>();
    const response = context.getResponse<Response>();
    const requestId = getRequestId(request);
    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const payload = this.getPayload(exception);

    const body: ApiErrorResponse = {
      error: {
        code:
          typeof payload.code === 'string'
            ? payload.code
            : (statusCodes[status] ?? 'INTERNAL_SERVER_ERROR'),
        message:
          status >= HttpStatus.INTERNAL_SERVER_ERROR
            ? '服务器内部错误'
            : this.getSafeMessage(payload, status),
        details: this.getSafeDetails(payload),
        requestId,
      },
    };

    const logContext = {
      requestId,
      method: request.method,
      path: request.originalUrl,
      statusCode: status,
    };

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error({ ...logContext, err: exception }, 'Unhandled request exception');
    } else {
      this.logger.warn(logContext, 'Request rejected');
    }

    response.status(status).json(body);
  }

  private getPayload(exception: unknown): ExceptionPayload {
    if (!(exception instanceof HttpException)) {
      return {};
    }

    const response = exception.getResponse();
    return typeof response === 'string' ? { message: response } : (response as ExceptionPayload);
  }

  private getSafeMessage(payload: ExceptionPayload, status: number): string {
    if (typeof payload.message === 'string') {
      return payload.message;
    }

    if (Array.isArray(payload.message)) {
      return '请求参数校验失败';
    }

    if (typeof payload.error === 'string') {
      return payload.error;
    }

    return status === HttpStatus.BAD_REQUEST ? '请求不合法' : '请求处理失败';
  }

  private getSafeDetails(payload: ExceptionPayload): Record<string, unknown> {
    if (payload.details && typeof payload.details === 'object' && !Array.isArray(payload.details)) {
      return payload.details as Record<string, unknown>;
    }

    return {};
  }
}
