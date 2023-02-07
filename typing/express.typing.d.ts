import { Request } from 'express';

import { SortDirection } from 'common/sort';

import { User } from '../src/users/entities/user.entity';

declare global {
  interface TypedRequest extends Request {
    cookies: {
      ACCESS_TOKEN: string;
      REFRESH_TOKEN: string;
      SESSION_ID: string;
    };
    currentUser: User;
    query: {
      page: string;
      sortDirection: SortDirection;
      sortType: string;
      take: string;
    };
  }
}
