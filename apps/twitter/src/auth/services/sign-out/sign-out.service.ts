import { Injectable } from '@nestjs/common';

import { SessionService } from '../session/session.service';
import { TokenService } from '../token/token.service';

import { SignOutFromAllDevicesOptions, SignOutOptions } from './sign-out-service.options';

@Injectable()
export class SignOutService {
  constructor(private readonly tokenService: TokenService, private readonly sessionService: SessionService) {}

  public async signOut({ sessionId }: SignOutOptions): Promise<void> {
    await this.tokenService.deleteRefreshTokenBySessionId(sessionId);
    await this.sessionService.cancelSession(sessionId);
  }

  public async singOutFromAllDevices({ userId }: SignOutFromAllDevicesOptions) {
    await this.tokenService.deleteAllUserRefreshTokens(userId);
    await this.sessionService.cancelAllUserSessions(userId);
  }
}
