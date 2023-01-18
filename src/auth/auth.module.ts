import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { HashModule } from 'common/hash';
import { MailerModule } from 'common/mailer';

import { UsersModule } from '../users/users.module';

import { AuthController } from './controllers/auth.controller';
import { SignUpConfirmationRepository } from './repositories/sign-up-confirmation.repository';
import { SignUpService } from './services/sign-up.service';

@Module({
  controllers: [AuthController],
  imports: [
    HashModule,
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
  ],
  providers: [SignUpConfirmationRepository, SignUpService],
})
export class AuthModule {}
