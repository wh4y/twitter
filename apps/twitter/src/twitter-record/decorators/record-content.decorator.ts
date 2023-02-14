import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { RecordContentDto } from '../dtos/record-content.dto';

export const RecordContent = createParamDecorator((data: string, ctx: ExecutionContext): RecordContentDto => {
  const request = ctx.switchToHttp().getRequest<TypedRequest>();
  const images = request.files;
  const body = request.body;

  return { ...body, images };
});
