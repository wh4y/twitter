import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { User } from '../../users/entities/user.entity';
import { UserFollowing } from '../entities/user-following.entity';
import { FOLLOWING_CREATED_EVENT, FollowingCreatedEventPayload } from '../events/following-created.event';
import { FOLLOWING_DELETED_EVENT } from '../events/following-deleted.event';
import { UserFollowingsRepository } from '../repositories/user-followings.repository';

@Injectable()
export class UserFollowingsService {
  constructor(private readonly userFollowingsRepository: UserFollowingsRepository, private readonly eventEmitter: EventEmitter2) {}

  public async followUser(userId: string, currentUser: User): Promise<UserFollowing> {
    const following = new UserFollowing({ followedUserId: userId, followerId: currentUser.id });

    await this.userFollowingsRepository.saveIfNotExistOrThrow(following);

    this.eventEmitter.emit(FOLLOWING_CREATED_EVENT, new FollowingCreatedEventPayload(following));

    return following;
  }

  public async unfollowUser(followedUserId: string, currentUser: User): Promise<void> {
    const following = await this.userFollowingsRepository.deleteByFollowerAndFollowedUserIdsOrThrow(currentUser.id, followedUserId);

    this.eventEmitter.emit(FOLLOWING_DELETED_EVENT, following);
  }

  public async getUserFollowers(userId: string): Promise<UserFollowing[]> {
    return this.userFollowingsRepository.findManyByFollowedUserIdOrThrow(userId);
  }

  public async getUserFollowings(userId: string): Promise<UserFollowing[]> {
    return this.userFollowingsRepository.findManyByFollowerIdOrThrow(userId);
  }

  public async getUserFollowersCount(userId: string): Promise<number> {
    return this.userFollowingsRepository.countFollowersByUserId(userId);
  }

  public async getUserFollowingsCount(userId: string): Promise<number> {
    return this.userFollowingsRepository.countFollowingsByUserId(userId);
  }
}
