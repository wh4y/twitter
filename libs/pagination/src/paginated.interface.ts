import { PaginationMetadata } from 'common/pagination/pagination-metadata.interface';

export interface Paginated<T> extends PaginationMetadata {
  data: T[];
}
