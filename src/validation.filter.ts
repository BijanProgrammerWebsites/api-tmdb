import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  ImATeapotException,
} from '@nestjs/common';

import { Response } from 'express';

@Catch(ImATeapotException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: ImATeapotException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    const validationErrors = exception.getResponse() as any;

    if (!validationErrors) {
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

    response.status(HttpStatus.BAD_REQUEST).json({
      statusCode: HttpStatus.BAD_REQUEST,
      error: 'Validation Failed',
      message: 'One or more conditions are not met.',
      validationErrors: formattedErrors,
    });
  }
}
