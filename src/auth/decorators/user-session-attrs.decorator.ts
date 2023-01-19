import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { UserSessionDto } from '../dtos/user-session.dto';

export const UserSessionAttrs = createParamDecorator((data: unknown, ctx: ExecutionContext): UserSessionDto => {
  const req = ctx.switchToHttp().getRequest<TypedRequest>();
  const { ACCESS_TOKEN, REFRESH_TOKEN, SESSION_ID } = req.cookies;

  return { accessToken: ACCESS_TOKEN, refreshToken: REFRESH_TOKEN, sessionId: SESSION_ID };
});
