import { Injectable } from '@nestjs/common';
import { Response } from 'express';

import { AuthorizationTokensDto } from '../../dtos/authorization-tokens.dto';

@Injectable()
export class AuthCookieService {
  public setAuthorizationTokensAsCookies({ accessToken, refreshToken }: AuthorizationTokensDto, res: Response): void {
    res.cookie('ACCESS_TOKEN', accessToken);
    res.cookie('REFRESH_TOKEN', refreshToken);
  }

  public setSessionIdAsCookie(sessionId: string, res: Response): void {
    res.cookie('SESSION_ID', sessionId);
  }

  public unlinkAuthorizationTokensFromResponse(res: Response): void {
    res.clearCookie('REFRESH_TOKEN');
    res.clearCookie('ACCESS_TOKEN');
  }

  public unlinkSessionIdFromResponse(res: Response): void {
    res.clearCookie('SESSION_ID');
  }
}
