import { Controller, Get, UseGuards } from '@nestjs/common';

import { AuthGuard } from 'common/auth';
import { CurrentUser } from 'common/auth/decorator/current-user.decorator';

import { User } from '../../users/entities/user.entity';
import { Session } from '../entities/session.entity';
import { AuthCookieService } from '../services/auth-cookie/auth-cookie.service';
import { SessionService } from '../services/session/session.service';

@Controller('/session')
export class SessionController {
  constructor(private readonly sessionService: SessionService, private readonly authCookieService: AuthCookieService) {}

  @UseGuards(AuthGuard)
  @Get('/all')
  public async getCurrentUserActiveSessions(@CurrentUser() { id: userId }: User): Promise<Session[]> {
    return this.sessionService.getActiveUserSessions(userId);
  }
}
