import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Response } from 'express';

import { SessionExpiredException } from '../exceptions/session-expired.exception';
import { SessionNotExistException } from '../exceptions/session-not-exist.exception';

@Catch(SessionExpiredException, SessionNotExistException)
export class SessionExceptionFilter implements ExceptionFilter {
  public catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    let httpException: HttpException = new InternalServerErrorException();

    if (exception instanceof SessionExpiredException) {
      httpException = new HttpException({ statusCode: 440, message: exception.message, error: 'Session expired' }, 440);
    }

    if (exception instanceof SessionNotExistException) {
      httpException = new BadRequestException(exception.message);
    }

    res.status(httpException.getStatus()).json(httpException.getResponse());
  }
}
