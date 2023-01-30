import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Response } from 'express';

import { InvalidConfirmationCodeException } from '../exceptions/invalid-confirmation-code.exceptions';
import { SignUpConfirmationNotExistException } from '../exceptions/sign-up-confirmation-not-exist.exception';

@Catch(InvalidConfirmationCodeException, SignUpConfirmationNotExistException)
export class ConfirmSignUpExceptionFilter implements ExceptionFilter {
  public catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    const httpException: HttpException = new BadRequestException(exception.message);

    res.status(httpException.getStatus()).json(httpException.getResponse());
  }
}
