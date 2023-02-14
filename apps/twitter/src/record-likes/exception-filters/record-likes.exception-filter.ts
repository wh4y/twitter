import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ConflictException,
  ExceptionFilter,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Response } from 'express';

import { LikeAlreadyExistsExceptions } from '../exceptions/like-already-exists.exceptions';
import { LikeNotExitExceptions } from '../exceptions/like-not-exit.exceptions';

@Catch(LikeAlreadyExistsExceptions, LikeNotExitExceptions)
export class RecordLikesExceptionFilter implements ExceptionFilter {
  public catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    let httpException: HttpException;

    if (exception instanceof LikeAlreadyExistsExceptions) {
      httpException = new ConflictException(exception.message);
    }

    if (exception instanceof LikeNotExitExceptions) {
      httpException = new BadRequestException(exception.message);
    }

    res.status(httpException.getStatus()).json(httpException.getResponse());
  }
}
