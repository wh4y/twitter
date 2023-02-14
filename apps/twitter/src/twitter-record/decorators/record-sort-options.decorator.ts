import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { SortDirection, SortOptions } from 'common/sort';

import { RecordsSortType } from '../enums/records-sort-type.enum';

export const RecordSortOptions = createParamDecorator((data: string, ctx: ExecutionContext): SortOptions<RecordsSortType> => {
  const request = ctx.switchToHttp().getRequest<TypedRequest>();
  const sortType = request.query.sortType as RecordsSortType;
  const sortDirection = request.query.sortDirection as SortDirection;

  return { type: sortType, direction: sortDirection };
});
