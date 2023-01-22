import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { TweetContentDto } from '../dtos/tweet-content.dto';

export const TweetContent = createParamDecorator((data: string, ctx: ExecutionContext): TweetContentDto => {
  const request = ctx.switchToHttp().getRequest<TypedRequest>();
  const images = request.files;
  const body = request.body;

  return { ...body, images };
});
