import { Injectable } from '@nestjs/common';

import { User } from '../../users/entities/user.entity';
import { UserFollowing } from '../entities/user-following.entity';
import { UserFollowingsRepository } from '../repositories/user-followings.repository';

@Injectable()
export class UserFollowingsService {
  constructor(private readonly userFollowingsRepository: UserFollowingsRepository) {}

  public async followUser(userId: string, currentUser: User): Promise<UserFollowing> {
    const following = new UserFollowing({ followedUserId: userId, followerId: currentUser.id });

    await this.userFollowingsRepository.saveIfNotExistOrThrow(following);

    return following;
  }

  public async unfollowUser(followedUserId: string, currentUser: User): Promise<void> {
    await this.userFollowingsRepository.deleteByFollowerAndFollowedUserIdsOrThrow(currentUser.id, followedUserId);
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
