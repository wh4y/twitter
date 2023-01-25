import { AbilityBuilder, createMongoAbility, MongoAbility, PureAbility } from '@casl/ability';
import { Injectable } from '@nestjs/common';

import { Retweet } from '../../retweet/entities/retweet.entity';
import { Tweet } from '../../tweet/entities/tweet.entity';
import { UserRecordsPrivacyService } from '../../user-privacy/services/user-records-privacy.service';
import { User } from '../../users/entities/user.entity';
import { ActionForbiddenException } from '../exceptions/action-forbidden.exception';
import { InvalidSubjectException } from '../exceptions/invalid-subject.exception';

@Injectable()
export class RecordPermissionsService {
  constructor(private readonly userRecordsPrivacyService: UserRecordsPrivacyService) {}

  public async defineAbilityToCommentOnRecordsFor(currentUser: User): Promise<PureAbility> {
    const { build, can } = new AbilityBuilder<MongoAbility>(createMongoAbility);

    can('comment', 'Record', {
      'privacySettings.isCommentingAllowed': false,
      'privacySettings.usersExceptedFromCommentingRules': {
        $elemMatch: { id: currentUser.id },
      },
    });

    can('comment', 'Record', {
      'privacySettings.isCommentingAllowed': true,
      'privacySettings.usersExceptedFromCommentingRules': {
        $size: 0,
      },
    });

    can('comment', 'Record', {
      'privacySettings.isCommentingAllowed': true,
      'privacySettings.usersExceptedFromCommentingRules': {
        $elemMatch: { id: { $ne: currentUser.id } },
      },
    });

    return build({
      detectSubjectType: <T extends Tweet | Comment | Retweet>(subject: T) => {
        const validSubjectsNames = ['TwitterRecord'];

        if (!validSubjectsNames.includes(subject.constructor.name)) {
          throw new InvalidSubjectException();
        }

        return 'Record';
      },
    });
  }

  public async defineAbilityToViewRecordsFor(currentUser: User): Promise<PureAbility> {
    const { build, can } = new AbilityBuilder<MongoAbility>(createMongoAbility);

    can('view', 'Record', {
      authorId: currentUser.id,
    });

    can('view', 'Record', {
      'privacySettings.isHidden': true,
      'privacySettings.usersExceptedFromViewingRules': {
        $elemMatch: { id: currentUser.id },
      },
    });

    can('view', 'Record', {
      'privacySettings.isHidden': false,
      'privacySettings.usersExceptedFromViewingRules': {
        $size: 0,
      },
    });

    can('view', 'Record', {
      'privacySettings.isHidden': false,
      'privacySettings.usersExceptedFromViewingRules': {
        $elemMatch: { id: { $ne: currentUser.id } },
      },
    });

    return build({
      detectSubjectType: <T extends Tweet | Comment | Retweet>(subject: T) => {
        const validSubjectsNames = ['Tweet', 'Comment', 'Retweet'];

        if (!validSubjectsNames.includes(subject.constructor.name)) {
          throw new InvalidSubjectException();
        }

        return 'Record';
      },
    });
  }

  public async defineAbilityToManageRecordsFor(currentUser: User): Promise<PureAbility> {
    const { build, can } = new AbilityBuilder<MongoAbility>(createMongoAbility);

    can('delete', 'Record', {
      authorId: currentUser.id,
    });

    can('edit', 'Record', {
      authorId: currentUser.id,
    });

    return build({
      detectSubjectType: <T extends Tweet | Comment | Retweet>(subject: T) => {
        const validSubjectsNames = ['Tweet', 'Comment', 'Retweet'];

        if (!validSubjectsNames.includes(subject.constructor.name)) {
          throw new InvalidSubjectException();
        }

        return 'Record';
      },
    });
  }

  public async currentUserCanViewUserRecordsOrThrow(currentUser: User, user: User): Promise<void> {
    const { areHidden, usersExceptedFromViewingRules } = await this.userRecordsPrivacyService.findUserRecordsPrivacySettings(user.id);

    let doesCurrentUserAllowedToViewUserRecords: boolean;

    if (areHidden) {
      doesCurrentUserAllowedToViewUserRecords = usersExceptedFromViewingRules.some((user) => user.id === currentUser.id);
    } else {
      doesCurrentUserAllowedToViewUserRecords = usersExceptedFromViewingRules.every((user) => user.id !== currentUser.id);
    }

    if (!doesCurrentUserAllowedToViewUserRecords) {
      throw new ActionForbiddenException();
    }
  }

  public async currentUserCanCommentOnUserRecordsOrThrow(currentUser: User, user: User): Promise<void> {
    const { isCommentingAllowed, usersExceptedFromCommentingRules } =
      await this.userRecordsPrivacyService.findUserRecordsPrivacySettings(user.id);

    let doesCurrentUserAllowedToCommentOnUserRecords: boolean;

    if (isCommentingAllowed) {
      doesCurrentUserAllowedToCommentOnUserRecords = usersExceptedFromCommentingRules.every((user) => user.id !== currentUser.id);
    } else {
      doesCurrentUserAllowedToCommentOnUserRecords = usersExceptedFromCommentingRules.some((user) => user.id === currentUser.id);
    }

    if (!doesCurrentUserAllowedToCommentOnUserRecords) {
      throw new ActionForbiddenException();
    }
  }
}
