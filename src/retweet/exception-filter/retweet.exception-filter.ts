import { ArgumentsHost, BadRequestException, Catch, ConflictException, ExceptionFilter, HttpException } from '@nestjs/common';
import { Response } from 'express';

import { RecordAlreadyExistsException } from '../../twitter-record/exceptions/record-already-exists.exception';
import { RecordNotExistException } from '../../twitter-record/exceptions/record-not-exist.exception';

@Catch(RecordNotExistException, RecordAlreadyExistsException)
export class RetweetExceptionFilter implements ExceptionFilter {
  public catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    let httpException: HttpException;

    if (exception instanceof RecordAlreadyExistsException) {
      httpException = new ConflictException('User has already retweeted given record!');
    }

    if (exception instanceof RecordNotExistException) {
      httpException = new BadRequestException(exception.message);
    }

    res.status(httpException.getStatus()).json(httpException.getResponse());
  }
}
