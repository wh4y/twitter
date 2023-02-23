import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { NEST_JWT_SERVICE, NestJwtService } from 'common/nest-jwt';

import { AccessTokenExpiredException } from '../exceptions/access-token-expired.exception';

@Injectable()
export class TokenService {
  constructor(@Inject(NEST_JWT_SERVICE) private readonly jwtService: NestJwtService, private readonly configService: ConfigService) {}

  public async verifyAccessToken(token: string): Promise<{ userId: string }> {
    let payload: { userId: string };

    try {
      const secret = this.configService.get<string>(`ACCESS_TOKEN_SECRET`);

      payload = await this.jwtService.verifyAsync(token, { secret });
    } catch (e) {
      if (e.constructor.name === 'TokenExpiredError') {
        throw new AccessTokenExpiredException();
      }
    }

    return payload;
  }
}
