import { UserFollowing } from '../entities/user-following.entity';

export const FOLLOWING_DELETED_EVENT = 'FOLLOWING_DELETED_EVENT';

export class FollowingDeletedEventPayload {
  constructor(public readonly following: UserFollowing) {}
}
