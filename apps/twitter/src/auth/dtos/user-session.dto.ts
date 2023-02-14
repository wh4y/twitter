import { AuthorizationTokensDto } from './authorization-tokens.dto';

export class UserSessionDto extends AuthorizationTokensDto {
  sessionId: string;
}
