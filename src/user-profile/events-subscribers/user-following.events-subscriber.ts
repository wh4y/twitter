import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { FOLLOWING_CREATED_EVENT, FollowingCreatedEventPayload } from '../../user-followings/events/following-created.event';
import { FOLLOWING_DELETED_EVENT } from '../../user-followings/events/following-deleted.event';
import { UserProfileService } from '../services/user-profile.service';

@Injectable()
export class UserFollowingEventsSubscriber {
  constructor(private readonly userProfileService: UserProfileService) {}
  @OnEvent(FOLLOWING_CREATED_EVENT)
  public async handleFollowingCreatedEvent({
    following: { followedUserId, followerId },
  }: FollowingCreatedEventPayload): Promise<void> {
    const { followersCount } = await this.userProfileService.getUserProfile(followedUserId);
    const { followingsCount } = await this.userProfileService.getUserProfile(followerId);

    await this.userProfileService.updateUserFollowingsCount(followerId, followingsCount + 1);
    await this.userProfileService.updateUserFollowersCount(followedUserId, followersCount + 1);
  }

  @OnEvent(FOLLOWING_DELETED_EVENT)
  public async handleFollowingDeletedEvent({ following: { followedUserId, followerId } }): Promise<void> {
    const { followersCount } = await this.userProfileService.getUserProfile(followedUserId);
    const { followingsCount } = await this.userProfileService.getUserProfile(followerId);

    await this.userProfileService.updateUserFollowingsCount(followerId, followingsCount - 1);
    await this.userProfileService.updateUserFollowersCount(followedUserId, followersCount - 1);
  }
}
