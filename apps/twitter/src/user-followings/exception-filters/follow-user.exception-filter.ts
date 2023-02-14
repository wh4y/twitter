import { ArgumentsHost, Catch, ConflictException, ExceptionFilter, HttpException } from '@nestjs/common';
import { Response } from 'express';

import { FollowingAlreadyExistsException } from '../exceptions/following-already-exists.exception';

@Catch(FollowingAlreadyExistsException)
export class FollowUserExceptionFilter implements ExceptionFilter {
  public catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    const httpException: HttpException = new ConflictException(exception.message);

    res.status(httpException.getStatus()).json(httpException.getResponse());
  }
}
