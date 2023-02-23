import { Request } from 'express';

declare global {
  interface TypedRequest extends Request {
    cookies: {
      ACCESS_TOKEN: string;
      REFRESH_TOKEN: string;
      SESSION_ID: string;
    };
    currentUser: any;
    query: {
      exploreRecordsCategory: string;
      exploreUsersCategory: string;
      page: string;
      sortDirection: string;
      sortType: string;
      take: string;
      userProfileRecordsFiltrationType: string;
    };
  }
}
