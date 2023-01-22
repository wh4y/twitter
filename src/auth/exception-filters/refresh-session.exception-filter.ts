import { ArgumentsHost, Catch, ExceptionFilter, HttpException, UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';

import { RefreshTokenMustBeProvidedException } from '../exceptions/refresh-token-must-be-provided.exception';
import { RefreshTokenNotExistException } from '../exceptions/refresh-token-not-exist.exception';
import { SessionNotExistException } from '../exceptions/session-not-exist.exception';

@Catch(RefreshTokenNotExistException, SessionNotExistException, RefreshTokenMustBeProvidedException)
export class RefreshSessionExceptionFilter implements ExceptionFilter {
  public catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    const httpException: HttpException = new UnauthorizedException('Refresh session request failed!');

    res.status(httpException.getStatus()).json(httpException.getResponse());
  }
}
