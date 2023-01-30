import { ArgumentsHost, Catch, ConflictException, ExceptionFilter, HttpException } from '@nestjs/common';
import { Response } from 'express';

import { UserAlreadyExistsException } from '../exceptions/user-already-exists.exception';

@Catch(UserAlreadyExistsException)
export class UserAlreadyExistsExceptionFilter implements ExceptionFilter {
  public catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    const httpException: HttpException = new ConflictException(exception.message);

    res.status(httpException.getStatus()).json(httpException.getResponse());
  }
}
