import { Body, Controller, HttpCode, HttpStatus, Post, Res } from '@nestjs/common';
import { Response } from 'express';

import { PrivacyInfo } from '../decorators/privacy-info.decorator';
import { ConfirmSignUpDto } from '../dtos/confirm-sign-up.dto';
import { PrivacyInfoDto } from '../dtos/privacy-info.dto';
import { SignInCredentialsDto } from '../dtos/sign-in-credentials.dto';
import { SignUpDto } from '../dtos/sign-up.dto';
import { AuthCookieService } from '../services/auth-cookie/auth-cookie.service';
import { SessionService } from '../services/session/session.service';
import { SignInService } from '../services/sign-in/sign-in.service';
import { SignUpService } from '../services/sign-up/sign-up.service';

@Controller('/auth')
export class AuthController {
  constructor(
    private readonly signUpService: SignUpService,
    private readonly sinInService: SignInService,
    private readonly sessionService: SessionService,
    private readonly authCookieService: AuthCookieService,
  ) {}

  @HttpCode(HttpStatus.ACCEPTED)
  @Post('/sign-up')
  public async signUp(@Body() dto: SignUpDto): Promise<void> {
    await this.signUpService.processSignupRequest(dto);
  }

  @Post('/confirm-sign-up')
  public async confirmSignUp(
    @Body() dto: ConfirmSignUpDto,
    @PrivacyInfo() { ip, userAgent }: PrivacyInfoDto,
    @Res() res: Response,
  ): Promise<void> {
    const { id: userId } = await this.signUpService.confirmSignUp(dto);
    const { sessionId, ...tokens } = await this.sessionService.startNewUserSession({ userId, userAgent, ip });

    this.authCookieService.setAuthorizationTokensAsCookies(tokens, res);
    this.authCookieService.setSessionIdAsCookie(sessionId, res);

    res.end();
  }

  @Post('/sign-in')
  public async singIn(
    @Body() dto: SignInCredentialsDto,
    @PrivacyInfo() { ip, userAgent }: PrivacyInfoDto,
    @Res() res: Response,
  ): Promise<void> {
    const { id: userId } = await this.sinInService.signIn({ ...dto, userAgent, ip });
    const { sessionId, ...tokens } = await this.sessionService.startNewUserSession({ userId, userAgent, ip });

    this.authCookieService.setAuthorizationTokensAsCookies(tokens, res);
    this.authCookieService.setSessionIdAsCookie(sessionId, res);

    res.end();
  }
}
