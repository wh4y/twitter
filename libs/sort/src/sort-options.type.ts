import { SortDirection } from 'common/sort/sort-direction.enum';

export type SortOptions<T> = {
  direction: SortDirection;
  type: T;
};
