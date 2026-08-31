import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, map } from 'rxjs';
import { getRequestId, RequestWithId } from '../request/request-id';
import type { ApiResponse, ResponseEnvelope } from '../response/api-response.types';
import { SKIP_RESPONSE_WRAPPER_KEY } from '../response/skip-response-wrapper.decorator';

@Injectable()
export class ApiResponseInterceptor<T> implements NestInterceptor<
  T | ResponseEnvelope<T>,
  ApiResponse<T> | T | ResponseEnvelope<T>
> {
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<T | ResponseEnvelope<T>>,
  ): Observable<ApiResponse<T> | T | ResponseEnvelope<T>> {
    const skipWrapper = this.reflector.getAllAndOverride<boolean>(SKIP_RESPONSE_WRAPPER_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (skipWrapper) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<RequestWithId>();

    return next.handle().pipe(
      map((body) => {
        const requestId = getRequestId(request);

        if (this.isEnvelope(body)) {
          return {
            data: body.data,
            meta: {
              ...body.meta,
              requestId,
            },
          };
        }

        return {
          data: body ?? null,
          meta: {
            requestId,
          },
        };
      }),
    );
  }

  private isEnvelope(value: T | ResponseEnvelope<T>): value is ResponseEnvelope<T> {
    return (
      typeof value === 'object' &&
      value !== null &&
      Object.prototype.hasOwnProperty.call(value, 'data') &&
      Object.prototype.hasOwnProperty.call(value, 'meta')
    );
  }
}
