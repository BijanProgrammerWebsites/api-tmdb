import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
} from '@nestjs/common';

import { Response } from 'express';

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    const validationErrors = exception.getResponse() as any;

    if (!(validationErrors && Array.isArray(validationErrors.message))) {
      response.status(status).json(exception.getResponse());
      return;
    }

    const formattedErrors = {};

    validationErrors.message.forEach((error: string) => {
      const fieldMatch = error.match(/^([a-zA-Z0-9]+)/);

      const field = fieldMatch?.[0] ?? 'unknown';

      if (!formattedErrors[field]) {
        formattedErrors[field] = [];
      }

      formattedErrors[field].push(error);
    });

    response.status(status).json({
      statusCode: status,
      error: 'Validation Failed',
      message: 'One or more conditions are not met.',
      validationErrors: formattedErrors,
    });
  }
}
