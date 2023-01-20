import { Injectable } from '@nestjs/common';

import { UserSessionDto } from '../../dtos/user-session.dto';
import { Session } from '../../entities/session.entity';
import { TokenType } from '../../enums/token-type.enum';
import { RefreshTokenNotExistException } from '../../exceptions/refresh-token-not-exist.exception';
import { SessionExpiredException } from '../../exceptions/session-expired.exception';
import { SessionNotExistException } from '../../exceptions/session-not-exist.exception';
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
    let sessionId: string;

    try {
      await this.tokenService.deleteRefreshTokenByValue(refreshToken);
      const payload = await this.tokenService.verifyJWT<{ sessionId: string }>(refreshToken, TokenType.REFRESH);

      sessionId = payload.sessionId;
    } catch (e) {
      if (e instanceof TokenExpiredException) {
        throw new SessionExpiredException();
      }

      if (e instanceof RefreshTokenNotExistException) {
        throw new SessionNotExistException();
      }

      throw e;
    }

    const { ip, userAgent, userId } = await this.sessionRepository.findByIdOrThrow(sessionId);

    await this.sessionRepository.deleteById(sessionId);

    return this.startNewUserSession({ ip, userAgent, userId });
  }

  public async deleteAllUserSessions(userId: string): Promise<void> {
    await this.sessionRepository.deleteByUserId(userId);
    await this.tokenService.deleteAllUserRefreshTokens(userId);
  }

  public async deleteSessionById(id: string): Promise<void> {
    await this.sessionRepository.deleteById(id);
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
