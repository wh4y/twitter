import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HashModule } from 'common/hash';
import { MailerModule } from 'common/mailer';
import { NestJwtModule } from 'common/nest-jwt';

import { UsersModule } from '../users/users.module';

import { AuthController } from './controllers/auth.controller';
import { SessionController } from './controllers/session.controller';
import { RefreshToken } from './entities/refresh-token.entity';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';
import { SessionRepository } from './repositories/session.repository';
import { SignUpConfirmationRepository } from './repositories/sign-up-confirmation.repository';
import { AuthCookieService } from './services/auth-cookie/auth-cookie.service';
import { SessionService } from './services/session/session.service';
import { SignInService } from './services/sign-in/sign-in.service';
import { SignUpService } from './services/sign-up/sign-up.service';
import { TokenService } from './services/token/token.service';

@Module({
  controllers: [AuthController, SessionController],
  imports: [
    HashModule,
    TypeOrmModule.forFeature([RefreshToken]),
    MailerModule.registerAsync({
      useFactory: (configService: ConfigService) => {
        return {
          host: configService.get<string>('MAIL_SERVICE_HOST'),
          port: configService.get<number>('MAIL_SERVICE_PORT'),
          user: configService.get<string>('MAIL_SERVICE_USER'),
          password: configService.get<string>('MAIL_SERVICE_PASS'),
        };
      },
      inject: [ConfigService],
    }),
    UsersModule,
    NestJwtModule,
  ],
  providers: [
    SignUpConfirmationRepository,
    SignUpService,
    SignInService,
    TokenService,
    RefreshTokenRepository,
    SessionService,
    SessionRepository,
    AuthCookieService,
  ],
})
export class AuthModule {}
