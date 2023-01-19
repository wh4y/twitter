import { Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';

import { UserSessionAttrs } from '../decorators/user-session-attrs.decorator';
import { UserSessionDto } from '../dtos/user-session.dto';
import { AuthCookieService } from '../services/auth-cookie/auth-cookie.service';
import { SessionService } from '../services/session/session.service';

@Controller('/session')
export class SessionController {
  constructor(private readonly sessionService: SessionService, private readonly authCookieService: AuthCookieService) {}

  @Post('/refresh')
  public async refreshSession(@Res() res: Response, @UserSessionAttrs() { sessionId }: UserSessionDto): Promise<void> {
    const { sessionId: newSessionId, ...tokens } = await this.sessionService.refreshSession(sessionId);

    this.authCookieService.setAuthorizationTokensAsCookies(tokens, res);
    this.authCookieService.setSessionIdAsCookie(newSessionId, res);

    res.end();
  }
}
