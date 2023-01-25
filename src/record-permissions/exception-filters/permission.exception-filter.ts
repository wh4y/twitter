import { ForbiddenError } from '@casl/ability';
import { ArgumentsHost, Catch, ExceptionFilter, ForbiddenException, HttpException } from '@nestjs/common';
import { Response } from 'express';

import { ActionForbiddenException } from '../exceptions/action-forbidden.exception';

@Catch(ForbiddenError, ActionForbiddenException)
export class PermissionExceptionFilter implements ExceptionFilter {
  public catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    const httpException: HttpException = new ForbiddenException('Action forbidden!');

    res.status(httpException.getStatus()).json(httpException.getResponse());
  }
}
