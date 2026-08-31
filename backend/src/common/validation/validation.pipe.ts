import { BadRequestException, ValidationError, ValidationPipe } from '@nestjs/common';

interface ValidationFieldError {
  field: string;
  messages: string[];
}

function flattenValidationErrors(
  errors: ValidationError[],
  parentPath = '',
): ValidationFieldError[] {
  return errors.flatMap((error) => {
    const field = parentPath ? `${parentPath}.${error.property}` : error.property;
    const currentError = error.constraints
      ? [
          {
            field,
            messages: Object.values(error.constraints),
          },
        ]
      : [];

    return [...currentError, ...flattenValidationErrors(error.children ?? [], field)];
  });
}

export function createValidationPipe(): ValidationPipe {
  return new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: false,
    },
    validationError: {
      target: false,
      value: false,
    },
    exceptionFactory: (errors: ValidationError[]) =>
      new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: '请求参数校验失败',
        details: {
          fields: flattenValidationErrors(errors),
        },
      }),
  });
}
