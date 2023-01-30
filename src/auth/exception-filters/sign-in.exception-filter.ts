import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Response } from 'express';

import { RecordNotExistException } from '../../twitter-record/exceptions/record-not-exist.exception';
import { UserNotExistException } from '../../users/exceptions/user-not-exist.exception';
import { PasswordNotValidException } from '../exceptions/password-not-valid.exception';

@Catch(PasswordNotValidException, UserNotExistException)
export class SignInExceptionFilter implements ExceptionFilter {
  public catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    const httpException: HttpException = new BadRequestException('Email or password is not valid!');

    res.status(httpException.getStatus()).json(httpException.getResponse());
  }
}
