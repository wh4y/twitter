import { Injectable } from '@nestjs/common';

import { HashService } from 'common/hash';
import { MailerService } from 'common/mailer';

import { User } from '../../../users/entities/user.entity';
import { UsersService } from '../../../users/services/users.service';
import { PrivacyInfoDto } from '../../dtos/privacy-info.dto';
import { PasswordNotValidException } from '../../exceptions/password-not-valid.exception';

import { SignInOptions } from './sign-in-service.options';

@Injectable()
export class SignInService {
  constructor(
    private readonly usersService: UsersService,
    private readonly hashService: HashService,
    private readonly mailerService: MailerService,
  ) {}

  public async signIn({ email, password, ...privacyInfo }: SignInOptions): Promise<User> {
    const user = await this.usersService.findUserByEmail(email);

    const isPasswordValid = await this.hashService.compare(user.password, password);

    if (!isPasswordValid) {
      throw new PasswordNotValidException();
    }

    await this.sendSignInNotification(email, privacyInfo);

    return user;
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
