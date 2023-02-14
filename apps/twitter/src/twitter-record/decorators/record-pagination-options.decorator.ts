import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { PaginationOptions } from 'common/pagination';

export const RecordPaginationOptions = createParamDecorator((data: string, ctx: ExecutionContext): PaginationOptions => {
  const request = ctx.switchToHttp().getRequest<TypedRequest>();
  const take = Number(request.query.take) || null;
  const page = Number(request.query.page) || 1;

  return { take, page };
});
