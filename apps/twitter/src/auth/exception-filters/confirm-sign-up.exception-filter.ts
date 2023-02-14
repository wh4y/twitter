import { ArgumentsHost, Catch, ExceptionFilter, HttpException, NotFoundException } from '@nestjs/common';
import { Response } from 'express';

import { InvalidConfirmationCodeException } from '../exceptions/invalid-confirmation-code.exceptions';
import { SignUpConfirmationNotExistException } from '../exceptions/sign-up-confirmation-not-exist.exception';

@Catch(InvalidConfirmationCodeException, SignUpConfirmationNotExistException)
export class ConfirmSignUpExceptionFilter implements ExceptionFilter {
  public catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    const httpException: HttpException = new NotFoundException(exception.message);

    res.status(httpException.getStatus()).json(httpException.getResponse());
  }
}
