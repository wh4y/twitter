import { Module } from '@nestjs/common';

import { NestJwtModule } from 'common/nest-jwt';

import { SessionRepository } from './repositories/session.repository';
import { SessionService } from './services/session.service';
import { TokenService } from './services/token.service';
import { WsAuthService } from './services/ws-auth.service';

@Module({
  imports: [NestJwtModule],
  providers: [SessionService, SessionRepository, WsAuthService, TokenService],
  exports: [SessionService, WsAuthService, TokenService],
})
export class AuthModule {}
