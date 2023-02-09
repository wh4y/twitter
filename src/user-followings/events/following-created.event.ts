import { UserFollowing } from '../entities/user-following.entity';

export const FOLLOWING_CREATED_EVENT = 'FOLLOWING_CREATED_EVENT';

export class FollowingCreatedEventPayload {
  constructor(public readonly following: UserFollowing) {}
}
