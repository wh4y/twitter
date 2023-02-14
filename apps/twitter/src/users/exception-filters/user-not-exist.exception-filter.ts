import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Response } from 'express';

import { UserNotExistException } from '../exceptions/user-not-exist.exception';

@Catch(UserNotExistException)
export class UserNotExistExceptionFilter implements ExceptionFilter {
  public catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    const httpException: HttpException = new BadRequestException(exception.message);

    res.status(httpException.getStatus()).json(httpException.getResponse());
  }
}
