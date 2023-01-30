import { ArgumentsHost, Catch, ConflictException, ExceptionFilter, HttpException } from '@nestjs/common';
import { Response } from 'express';

import { EmailAlreadyRegisteredException } from '../exceptions/email-already-registered.exception';
import { SignUpConfirmationAlreadyExistsException } from '../exceptions/sign-up-confirmation-already-exists.exception';

@Catch(EmailAlreadyRegisteredException, SignUpConfirmationAlreadyExistsException)
export class SignUpExceptionFilter implements ExceptionFilter {
  public catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    let httpException: HttpException = new ConflictException(exception.message);

    if (exception instanceof SignUpConfirmationAlreadyExistsException) {
      httpException = new ConflictException(exception.message);
    }

    res.status(httpException.getStatus()).json(httpException.getResponse());
  }
}
