import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';

import { HashService } from 'common/hash';
import { MailerService } from 'common/mailer';

import { User } from '../../../users/entities/user.entity';
import { UsersService } from '../../../users/services/users.service';
import { SignUpConfirmation } from '../../entities/sign-up-confirmation.entity';
import { EmailAlreadyRegisteredException } from '../../exceptions/email-already-registered.exception';
import { InvalidConfirmationCodeException } from '../../exceptions/invalid-confirmation-code.exceptions';
import { SignUpConfirmationRepository } from '../../repositories/sign-up-confirmation.repository';

import { ConfirmSignUpOptions, SignUpRequestOptions } from './sign-up-service.options';

@Injectable()
export class SignUpService {
  constructor(
    private readonly usersService: UsersService,
    private readonly hashService: HashService,
    private readonly mailerService: MailerService,
    private readonly signUpConfirmationRepository: SignUpConfirmationRepository,
  ) {}

  public async processSignupRequest({ email, name, password }: SignUpRequestOptions): Promise<void> {
    const doesEmailAlreadyRegistered = await this.usersService.doesUserExistByEmail(email);

    if (doesEmailAlreadyRegistered) {
      throw new EmailAlreadyRegisteredException();
    }

    const hashedPassword = await this.hashService.hash(password);
    const code = this.generateConfirmationCode();

    const signUpConfirmation = new SignUpConfirmation({ code, email, hashedPassword, username: name });

    await this.signUpConfirmationRepository.save(signUpConfirmation);

    await this.sendConfirmationCode(email, code);
  }

  private async sendConfirmationCode(to: string, code: number): Promise<void> {
    const html = `<p>Your confirmation code: <b>${code}</b><p>`;
    const subject = 'Sign up confirmation';

    await this.mailerService.sendMail({ to, subject, html });
  }

  public async confirmSignUp({ code: incomingCode, email }: ConfirmSignUpOptions): Promise<User> {
    const { code, hashedPassword, username } = await this.signUpConfirmationRepository.getByEmail(email);

    const isCodeValid = code === incomingCode;

    if (!isCodeValid) {
      throw new InvalidConfirmationCodeException();
    }

    await this.signUpConfirmationRepository.deleteByEmail(email);

    return this.usersService.addNewUser({ email, name: username, password: hashedPassword });
  }

  private generateConfirmationCode(): number {
    return Math.abs(randomBytes(15).readInt32BE());
  }
}
