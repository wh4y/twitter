import { Controller, Delete, Get, Param, Post, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';

import { AuthGuard } from 'common/auth';
import { CurrentUser } from 'common/auth/decorator/current-user.decorator';

import { User } from '../../users/entities/user.entity';
import { UserSessionAttrs } from '../decorators/user-session-attrs.decorator';
import { UserSessionDto } from '../dtos/user-session.dto';
import { Session } from '../entities/session.entity';
import { AuthCookieService } from '../services/auth-cookie/auth-cookie.service';
import { SessionService } from '../services/session/session.service';

@Controller('/session')
export class SessionController {
  constructor(private readonly sessionService: SessionService, private readonly authCookieService: AuthCookieService) {}

  @Post('/refresh')
  public async refreshSession(@Res() res: Response, @UserSessionAttrs() { refreshToken }: UserSessionDto): Promise<void> {
    const { sessionId: newSessionId, ...tokens } = await this.sessionService.refreshSessionWithRefreshToken(refreshToken);

    this.authCookieService.setAuthorizationTokensAsCookies(tokens, res);
    this.authCookieService.setSessionIdAsCookie(newSessionId, res);

    res.end();
  }

  @UseGuards(AuthGuard)
  @Get('/all')
  public async getCurrentUserActiveSessions(@CurrentUser() { id: userId }: User): Promise<Session[]> {
    return this.sessionService.getActiveUserSessions(userId);
  }

  @UseGuards(AuthGuard)
  @Delete('/all')
  public async deleteAllCurrentUserSessions(@CurrentUser() { id: userId }: User): Promise<void> {
    await this.sessionService.deleteAllUserSessions(userId);
  }

  @UseGuards(AuthGuard)
  @Delete('/:sessionId')
  public async deleteCurrentUserSessionById(@CurrentUser() user: User, @Param('sessionId') sessionId: string): Promise<void> {
    await this.sessionService.deleteSessionById(sessionId);
  }
}
