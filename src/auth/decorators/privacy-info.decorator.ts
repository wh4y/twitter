import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const PrivacyInfo = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest<TypedRequest>();
  const userAgent = req.get('user-agent');
  const ip = req.socket.remoteAddress;

  return { userAgent, ip };
});
