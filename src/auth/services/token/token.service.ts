import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { NEST_JWT_SERVICE, NestJwtService } from 'common/nest-jwt';
import { TokenType } from 'src/auth/enums/token-type.enum';

import { RefreshToken } from '../../entities/refresh-token.entity';
import { Session } from '../../entities/session.entity';
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

  public async generateAccessToken(userId: string): Promise<string> {
    return this.generateJWT({ userId }, TokenType.ACCESS);
  }

  public async generateRefreshToken(userId: string): Promise<string> {
    return this.generateJWT({ userId }, TokenType.REFRESH);
  }

  public async verifyJWT<T extends object>(token: string, type: TokenType): Promise<T> {
    const secret = this.configService.get<string>(`${type.toUpperCase()}_SECRET`);

    return this.jwtService.verifyAsync(token, { secret });
  }

  public decodeToken(token: string): { userId: string } {
    return this.jwtService.decode<{ userId: string }>(token);
  }

  public async createRefreshTokenForNewUserSession({ createdAt, id: sessionId, userId }: Session): Promise<RefreshToken> {
    const value = await this.generateRefreshToken(userId);

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
}
