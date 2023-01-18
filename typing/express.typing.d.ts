import { Request } from 'express';

import { User } from '../src/user/domain/model/user.domain-model';

declare global {
  interface TypedRequest extends Request {
    cookies: {
      ACCESS_TOKEN: string;
      REFRESH_TOKEN: string;
      SESSION_ID: string;
    };
    currentUser: User;
  }
}
