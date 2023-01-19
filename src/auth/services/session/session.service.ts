import { Injectable } from '@nestjs/common';

import { UserSessionDto } from '../../dtos/user-session.dto';
import { Session } from '../../entities/session.entity';
import { TokenType } from '../../enums/token-type.enum';
import { SessionExpiredException } from '../../exceptions/session-expired.exception';
import { TokenExpiredException } from '../../exceptions/token-expired.exception';
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
    const accessToken = await this.tokenService.generateAccessToken({ userId: options.userId });

    return { accessToken, refreshToken, sessionId: session.id };
  }

  public async refreshSessionWithRefreshToken(refreshToken: string): Promise<UserSessionDto> {
    let jwtPayload: { sessionId: string };

    try {
      jwtPayload = await this.tokenService.verifyJWT(refreshToken, TokenType.REFRESH);
      await this.tokenService.deleteRefreshTokenByValue(refreshToken);
    } catch (e) {
      if (e instanceof TokenExpiredException) {
        jwtPayload = this.tokenService.decodeToken(refreshToken);
        await this.sessionRepository.deleteSessionById(jwtPayload.sessionId);
        throw new SessionExpiredException();
      } else {
        throw e;
      }
    }

    const { ip, userAgent, userId } = await this.sessionRepository.findById(jwtPayload.sessionId);

    await this.sessionRepository.deleteSessionById(jwtPayload.sessionId);

    return this.startNewUserSession({ ip, userAgent, userId });
  }

  public async deleteAllUserSessions(userId: string): Promise<void> {
    await this.sessionRepository.deleteByUserId(userId);
    await this.tokenService.deleteAllUserRefreshTokens(userId);
  }

  public async deleteSessionById(id: string): Promise<void> {
    await this.sessionRepository.deleteSessionById(id);
    await this.tokenService.deleteRefreshTokenBySessionId(id);
  }

  public async getActiveUserSessions(userId: string): Promise<Session[]> {
    return this.sessionRepository.findManyByUserId(userId);
  }

  private async hasNumberOfActiveUserSessionsExceeded(userId: string): Promise<boolean> {
    const userSessionCount = await this.sessionRepository.getTotalUserSessionsCount(userId);

    return userSessionCount === 10;
  }
}
