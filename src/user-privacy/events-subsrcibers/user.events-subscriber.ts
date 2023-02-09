import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { USER_CREATED_EVENT, UserCreatedEventPayload } from '../../users/events/user-created.event';
import { UserRecordsPrivacyService } from '../services/user-records-privacy.service';

@Injectable()
export class UserEventsSubscriber {
  constructor(private readonly userPrivacyService: UserRecordsPrivacyService) {}

  @OnEvent(USER_CREATED_EVENT, { async: true })
  public async handleUserCreatedEvent({ user }: UserCreatedEventPayload): Promise<void> {
    await this.userPrivacyService.defineDefaultRecordsPrivacySettingsFor(user);
  }
}
