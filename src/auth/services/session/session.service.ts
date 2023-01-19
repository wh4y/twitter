import { Injectable, UnauthorizedException } from '@nestjs/common';

import { UserSessionDto } from '../../dtos/user-session.dto';
import { Session } from '../../entities/session.entity';
import { SessionRepository } from '../../repositories/session.repository';
import { TokenService } from '../token/token.service';

import { StartNewSessionOptions } from './session-service.options';

@Injectable()
export class SessionService {
  constructor(private readonly sessionRepository: SessionRepository, private readonly tokenService: TokenService) {}

  public async startNewUserSession(options: StartNewSessionOptions): Promise<UserSessionDto> {
    const hasNumberOfActiveUserSessionsExceeded = await this.hasNumberOfActiveUserSessionsExceeded(options.userId);

    if (hasNumberOfActiveUserSessionsExceeded) {
      await this.sessionRepository.deleteOldestSessionByUserId(options.userId);
      await this.tokenService.deleteOldestUserRefreshToken(options.userId);
    }

    const session = new Session({ ...options });

    await this.sessionRepository.save(session);

    const { value: refreshToken } = await this.tokenService.createRefreshTokenForNewUserSession(session);
    const accessToken = await this.tokenService.generateAccessToken(options.userId);

    return { accessToken, refreshToken, sessionId: session.id };
  }

  public async refreshSession(sessionId: string): Promise<UserSessionDto> {
    const session = await this.sessionRepository.findById(sessionId);

    const hasSessionExpired = await this.hasUserSessionExpired(session);

    await this.sessionRepository.deleteSessionById(sessionId);
    await this.tokenService.deleteRefreshTokenBySessionId(sessionId);

    if (hasSessionExpired) {
      throw new UnauthorizedException();
    }

    return this.startNewUserSession({ userId: session.userId, ip: session.ip, userAgent: session.userAgent });
  }

  private async hasNumberOfActiveUserSessionsExceeded(userId: string): Promise<boolean> {
    const userSessionCount = await this.sessionRepository.getTotalUserSessionsCount(userId);

    return userSessionCount === 10;
  }

  private async hasUserSessionExpired(session: Session): Promise<boolean> {
    const currentDate = new Date();

    return session.expiredAt < currentDate;
  }
}
