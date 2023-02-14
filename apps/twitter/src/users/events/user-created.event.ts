import { User } from '../entities/user.entity';

export const USER_CREATED_EVENT = 'USER_CREATED_EVENT';

export class UserCreatedEventPayload {
  constructor(public readonly user: User) {}
}
