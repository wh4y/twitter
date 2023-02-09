import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { USER_CREATED_EVENT, UserCreatedEventPayload } from '../../users/events/user-created.event';
import { UserProfileService } from '../services/user-profile.service';

@Injectable()
export class UserEventsSubscriber {
  constructor(private readonly userProfileService: UserProfileService) {}

  @OnEvent(USER_CREATED_EVENT, { async: true })
  public async handleUserCreatedEvent({ user }: UserCreatedEventPayload): Promise<void> {
    await this.userProfileService.createProfileFor(user);
  }
}
