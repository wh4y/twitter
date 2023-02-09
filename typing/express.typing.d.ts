import { Request } from 'express';

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
      exploreRecordsCategory: string;
      page: string;
      sortDirection: string;
      sortType: string;
      take: string;
      userProfileRecordsFiltrationType: string;
    };
  }
}
