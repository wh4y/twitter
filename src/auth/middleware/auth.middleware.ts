import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction } from 'express';

import { UsersService } from '../../users/services/users.service';
import { TokenType } from '../enums/token-type.enum';
import { TokenService } from '../services/token/token.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly tokenService: TokenService, private readonly usersService: UsersService) {}

  public async use(req: TypedRequest, res: Response, next: NextFunction): Promise<void> {
    const accessToken = req.cookies.ACCESS_TOKEN;

    req.currentUser = null;

    if (!accessToken) {
      next();

      return;
    }

    let userId: string;

    try {
      const payload = await this.tokenService.verifyJWT<{ userId: string }>(accessToken, TokenType.ACCESS);

      userId = payload.userId;
    } catch (e) {
      next();

      return;
    }

    req.currentUser = await this.usersService.getUserById(userId);

    next();
  }
}
