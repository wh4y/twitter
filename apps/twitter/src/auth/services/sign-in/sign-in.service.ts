import { Injectable } from '@nestjs/common';

import { HashService } from 'common/hash';
import { MailerService } from 'common/mailer';

import { UsersService } from '../../../users/services/users.service';
import { PrivacyInfoDto } from '../../dtos/privacy-info.dto';
import { UserSessionDto } from '../../dtos/user-session.dto';
import { PasswordNotValidException } from '../../exceptions/password-not-valid.exception';
import { SessionService } from '../session/session.service';
import { TokenService } from '../token/token.service';

import { SignInOptions } from './sign-in-service.options';

@Injectable()
export class SignInService {
  constructor(
    private readonly usersService: UsersService,
    private readonly hashService: HashService,
    private readonly mailerService: MailerService,
    private readonly tokenService: TokenService,
    private readonly sessionService: SessionService,
  ) {}

  public async signIn({ email, password, ...privacyInfo }: SignInOptions): Promise<UserSessionDto> {
    const user = await this.usersService.findUserByEmail(email);

    const isPasswordValid = await this.hashService.compare(user.password, password);

    if (!isPasswordValid) {
      throw new PasswordNotValidException();
    }

    const session = await this.sessionService.startNewUserSession({ ...privacyInfo, userId: user.id });

    const hasSessionCountExceeded = await this.sessionService.hasNumberOfActiveUserSessionsExceeded(user.id);

    if (hasSessionCountExceeded) {
      await this.tokenService.deleteOldestUserRefreshToken(user.id);
    }

    const tokens = await this.tokenService.createTokenPairForNewSession(session);

    await this.sendSignInNotification(email, privacyInfo);

    return { ...tokens, sessionId: session.id };
  }

  private async sendSignInNotification(to: string, userPrivacyInfoDto: PrivacyInfoDto): Promise<void> {
    const signInDatetime = new Date();
    const message = `
    Some one logged into your account:
    datetime: ${signInDatetime.toUTCString()}
    ip: ${userPrivacyInfoDto.ip}
    user-agent: ${userPrivacyInfoDto.userAgent}
    `;

    const subject = 'Some one logged into your account!';

    await this.mailerService.sendMail({ to, subject, text: message });
  }
}
