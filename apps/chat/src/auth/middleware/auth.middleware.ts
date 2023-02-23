import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { NextFunction } from 'express';

import { User } from '../../user/entities/user.entity';
import { TokenService } from '../services/token.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly tokenService: TokenService) {}

  public async use(req: TypedRequest, res: Response, next: NextFunction): Promise<void> {
    const accessToken = req.cookies.ACCESS_TOKEN;

    req.currentUser = null;

    if (!accessToken) {
      next();

      return;
    }

    let userId: string;

    try {
      const payload = await this.tokenService.verifyAccessToken(accessToken);

      userId = payload.userId;
    } catch (e) {
      next();

      throw new UnauthorizedException(e.message);

      return;
    }

    req.currentUser = new User({ id: userId });

    next();
  }
}
