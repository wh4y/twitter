import { ForbiddenError } from '@casl/ability';
import { ArgumentsHost, Catch, ExceptionFilter, ForbiddenException } from '@nestjs/common';
import { Response } from 'express';

import { AccessDeniedException } from '../exceptions/access-denied.exception';

@Catch(AccessDeniedException, ForbiddenError)
export class ChatPermissionsExceptionFilter implements ExceptionFilter {
  public catch(exception: AccessDeniedException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    const httpException: ForbiddenException = new ForbiddenException(exception.message);

    res.status(httpException.getStatus()).json(httpException.getResponse());
  }
}
