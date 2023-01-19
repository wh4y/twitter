import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ConfirmSignUpDto } from '../dtos/confirm-sign-up.dto';
import { SignUpDto } from '../dtos/sign-up.dto';
import { SignUpService } from '../services/sign-up/sign-up.service';

@Controller('/auth')
export class AuthController {
  constructor(private readonly signUpService: SignUpService) {}

  @HttpCode(HttpStatus.ACCEPTED)
  @Post('/sign-up')
  public async signUp(@Body() dto: SignUpDto): Promise<void> {
    await this.signUpService.processSignupRequest(dto);
  }

  @Post('/confirm-sign-up')
  public async confirmSignUp(@Body() dto: ConfirmSignUpDto): Promise<void> {
    await this.signUpService.confirmSignUp(dto);
  }
}
