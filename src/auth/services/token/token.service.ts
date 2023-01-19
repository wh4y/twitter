import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { NEST_JWT_SERVICE, NestJwtService } from 'common/nest-jwt';
import { TokenType } from 'src/auth/enums/token-type.enum';

import { RefreshToken } from '../../entities/refresh-token.entity';
import { Session } from '../../entities/session.entity';
import { TokenExpiredException } from '../../exceptions/token-expired.exception';
import { RefreshTokenRepository } from '../../repositories/refresh-token.repository';

@Injectable()
export class TokenService {
  constructor(
    @Inject(NEST_JWT_SERVICE) private readonly jwtService: NestJwtService,
    private readonly configService: ConfigService,
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  private generateJWT<P extends object>(payload: P, type: TokenType): string {
    const expiresIn = this.configService.get<string>(`${type.toUpperCase()}_EXPIRES_IN`);
    const secret = this.configService.get<string>(`${type.toUpperCase()}_SECRET`);

    return this.jwtService.sign(payload, { expiresIn, secret });
  }

  public async generateAccessToken<P extends object>(payload: P): Promise<string> {
    return this.generateJWT(payload, TokenType.ACCESS);
  }

  public async generateRefreshToken<P extends object>(payload: P): Promise<string> {
    return this.generateJWT(payload, TokenType.REFRESH);
  }

  public async verifyJWT<T extends object>(token: string, type: TokenType): Promise<T> {
    const secret = this.configService.get<string>(`${type.toUpperCase()}_SECRET`);

    let payload: T;

    try {
      payload = await this.jwtService.verifyAsync(token, { secret });
    } catch (e) {
      throw new TokenExpiredException();
    }

    return payload;
  }

  public decodeToken<P extends object>(token: string): P {
    return this.jwtService.decode<P>(token);
  }

  public async createRefreshTokenForNewUserSession({ createdAt, id: sessionId, userId }: Session): Promise<RefreshToken> {
    const value = await this.generateRefreshToken<{ sessionId: string }>({ sessionId });

    const refreshToken = new RefreshToken({ createdAt, sessionId, userId, value });

    await this.refreshTokenRepository.save(refreshToken);

    return refreshToken;
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
}
