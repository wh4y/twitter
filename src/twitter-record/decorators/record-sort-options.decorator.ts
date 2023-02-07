import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { SortOptions } from 'common/sort';

export const RecordSortOptions = createParamDecorator((data: string, ctx: ExecutionContext): SortOptions<any> => {
  const request = ctx.switchToHttp().getRequest<TypedRequest>();
  const sortType = request.query.sortType;
  const sortDirection = request.query.sortDirection;

  return { type: sortType, direction: sortDirection };
});
