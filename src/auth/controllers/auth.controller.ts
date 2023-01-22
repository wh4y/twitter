import { Body, Controller, Delete, HttpCode, HttpStatus, Post, Req, Res, UseFilters, UseGuards } from '@nestjs/common';
import { Response } from 'express';

import { AuthGuard } from 'common/auth';
import { CurrentUser } from 'common/auth/decorator/current-user.decorator';

import { User } from '../../users/entities/user.entity';
import { PrivacyInfo } from '../decorators/privacy-info.decorator';
import { UserSessionAttrs } from '../decorators/user-session-attrs.decorator';
import { ConfirmSignUpDto } from '../dtos/confirm-sign-up.dto';
import { PrivacyInfoDto } from '../dtos/privacy-info.dto';
import { SignInCredentialsDto } from '../dtos/sign-in-credentials.dto';
import { SignUpDto } from '../dtos/sign-up.dto';
import { UserSessionDto } from '../dtos/user-session.dto';
import { RefreshSessionExceptionFilter } from '../exception-filters/refresh-session.exception-filter';
import { AuthCookieService } from '../services/auth-cookie/auth-cookie.service';
import { SignInService } from '../services/sign-in/sign-in.service';
import { SignOutService } from '../services/sign-out/sign-out.service';
import { SignUpService } from '../services/sign-up/sign-up.service';
import { TokenService } from '../services/token/token.service';

@Controller('/auth')
export class AuthController {
  constructor(
    private readonly signUpService: SignUpService,
    private readonly sinInService: SignInService,
    private readonly authCookieService: AuthCookieService,
    private readonly tokenService: TokenService,
    private readonly signOutService: SignOutService,
  ) {}

  @HttpCode(HttpStatus.ACCEPTED)
  @Post('/sign-up')
  public async signUp(@Body() dto: SignUpDto): Promise<void> {
    await this.signUpService.processSignupRequest(dto);
  }

  @Post('/confirm-sign-up')
  public async confirmSignUp(
    @Body() dto: ConfirmSignUpDto,
    @PrivacyInfo() userPrivacyDto: PrivacyInfoDto,
    @Res() res: Response,
  ): Promise<void> {
    const { sessionId, ...tokens } = await this.signUpService.confirmSignUp({ ...dto, ...userPrivacyDto });

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
    const { sessionId, ...tokens } = await this.sinInService.signIn({ ...dto, userAgent, ip });

    this.authCookieService.setAuthorizationTokensAsCookies(tokens, res);
    this.authCookieService.setSessionIdAsCookie(sessionId, res);

    res.end();
  }

  @UseFilters(RefreshSessionExceptionFilter)
  @Post('/refresh')
  public async refreshToken(@Res() res: Response, @UserSessionAttrs() { refreshToken }: UserSessionDto): Promise<void> {
    const { sessionId: newSessionId, ...tokens } = await this.tokenService.refreshToken(refreshToken);

    this.authCookieService.setAuthorizationTokensAsCookies(tokens, res);
    this.authCookieService.setSessionIdAsCookie(newSessionId, res);

    res.end();
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  @Delete('/sign-out/all')
  public async signOutFromAllDevices(@CurrentUser() { id: userId }: User): Promise<void> {
    await this.signOutService.singOutFromAllDevices({ userId });
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  @Delete('/sign-out')
  public async signOut(@Req() req: TypedRequest, @Res() res: Response): Promise<void> {
    await this.signOutService.signOut({ sessionId: req.cookies.SESSION_ID });

    await this.authCookieService.unlinkAuthorizationTokensFromResponse(res);
    await this.authCookieService.unlinkSessionIdFromResponse(res);

    res.end();
  }
}
