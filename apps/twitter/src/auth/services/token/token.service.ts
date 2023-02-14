import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { NEST_JWT_SERVICE, NestJwtService } from 'common/nest-jwt';

import { AuthorizationTokensDto } from '../../dtos/authorization-tokens.dto';
import { UserSessionDto } from '../../dtos/user-session.dto';
import { RefreshToken } from '../../entities/refresh-token.entity';
import { Session } from '../../entities/session.entity';
import { TokenType } from '../../enums/token-type.enum';
import { RefreshTokenMustBeProvidedException } from '../../exceptions/refresh-token-must-be-provided.exception';
import { TokenExpiredException } from '../../exceptions/token-expired.exception';
import { RefreshTokenRepository } from '../../repositories/refresh-token.repository';
import { SessionService } from '../session/session.service';

@Injectable()
export class TokenService {
  constructor(
    @Inject(NEST_JWT_SERVICE) private readonly jwtService: NestJwtService,
    private readonly configService: ConfigService,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly sessionService: SessionService,
  ) {}

  private async generateAccessToken<P extends object>(payload: P): Promise<string> {
    const expiresIn = this.configService.get<string>(`${TokenType.ACCESS}_EXPIRES_IN`);
    const secret = this.configService.get<string>(`${TokenType.ACCESS}_SECRET`);

    return this.jwtService.sign(payload, { expiresIn, secret });
  }

  private async generateRefreshToken<P extends object>(payload: P): Promise<string> {
    const secret = this.configService.get<string>(`${TokenType.REFRESH}_SECRET`);

    return this.jwtService.sign(payload, { secret });
  }

  public async verifyJWT<T extends object>(token: string, type: TokenType): Promise<T> {
    let payload: T;

    try {
      const secret = this.configService.get<string>(`${type.toUpperCase()}_SECRET`);

      payload = await this.jwtService.verifyAsync(token, { secret });
    } catch (e) {
      if (e.constructor.name === 'TokenExpiredError') {
        throw new TokenExpiredException();
      }
    }

    return payload;
  }

  public decodeToken<P extends object>(token: string): P {
    return this.jwtService.decode<P>(token);
  }

  private async createRefreshTokenForNewUserSession({ createdAt, id: sessionId, userId }: Session): Promise<RefreshToken> {
    const value = await this.generateRefreshToken<{ sessionId: string }>({ sessionId });

    const refreshToken = new RefreshToken({ createdAt, sessionId, userId, value });

    await this.refreshTokenRepository.save(refreshToken);

    return refreshToken;
  }

  public async createTokenPairForNewSession(session: Session): Promise<AuthorizationTokensDto> {
    const { value } = await this.createRefreshTokenForNewUserSession(session);

    const accessToken = await this.generateAccessToken({ userId: session.userId });

    return { accessToken, refreshToken: value };
  }

  public async deleteOldestUserRefreshToken(userId: string): Promise<void> {
    await this.refreshTokenRepository.deleteOldestByUserId(userId);
  }

  public async deleteRefreshTokenBySessionId(sessionId: string): Promise<void> {
    await this.refreshTokenRepository.deleteBySessionId(sessionId);
  }

  public async deleteRefreshTokenByValue(value: string): Promise<void> {
    await this.refreshTokenRepository.deleteByValue(value);
  }

  public async deleteAllUserRefreshTokens(userId: string): Promise<void> {
    await this.refreshTokenRepository.deleteAllByUserId(userId);
  }

  public async refreshToken(refreshToken: string): Promise<UserSessionDto> {
    if (!refreshToken) {
      throw new RefreshTokenMustBeProvidedException();
    }

    const { sessionId } = await this.verifyJWT<{ sessionId: string }>(refreshToken, TokenType.REFRESH);

    await this.deleteRefreshTokenBySessionId(sessionId);

    const { ip, userAgent, userId } = await this.sessionService.cancelSession(sessionId);

    const newSession = await this.sessionService.startNewUserSession({ ip, userAgent, userId });

    const newTokens = await this.createTokenPairForNewSession(newSession);

    return { ...newTokens, sessionId: newSession.id };
  }
}
