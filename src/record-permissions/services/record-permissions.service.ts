import { AbilityBuilder, AbilityTuple, createMongoAbility, MatchConditions, MongoAbility, PureAbility } from '@casl/ability';
import { Injectable } from '@nestjs/common';

import { Retweet } from '../../retweet/entities/retweet.entity';
import { Tweet } from '../../tweet/entities/tweet.entity';
import { TwitterRecord } from '../../twitter-record/entities/twitter-record.entity';
import { UserRecordsPrivacyService } from '../../user-privacy/services/user-records-privacy.service';
import { User } from '../../users/entities/user.entity';
import { ActionForbiddenException } from '../exceptions/action-forbidden.exception';
import { InvalidSubjectException } from '../exceptions/invalid-subject.exception';

type UserAbility = PureAbility<AbilityTuple, MatchConditions>;
const lambdaMatcher = (matchConditions: MatchConditions) => matchConditions;

@Injectable()
export class RecordPermissionsService {
  constructor(private readonly userRecordsPrivacyService: UserRecordsPrivacyService) {}

  public async defineAbilityToCommentOnRecordsFor(currentUser: User): Promise<UserAbility> {
    const { build, can } = new AbilityBuilder<UserAbility>(PureAbility);

    can<TwitterRecord>('comment', 'Record', ({ privacySettings: { isCommentingAllowed, usersExceptedFromCommentingRules } }) => {
      return isCommentingAllowed && usersExceptedFromCommentingRules.every((user) => user.id !== currentUser.id);
    });

    can<TwitterRecord>('comment', 'Record', ({ privacySettings: { isCommentingAllowed, usersExceptedFromCommentingRules } }) => {
      return !isCommentingAllowed && usersExceptedFromCommentingRules.some((user) => user.id === currentUser.id);
    });

    return build({
      conditionsMatcher: lambdaMatcher,
      detectSubjectType: <T extends Tweet | Comment | Retweet>(subject: T) => {
        const validSubjectsNames = ['Tweet', 'Comment', 'Retweet', 'TwitterRecord'];

        if (!validSubjectsNames.includes(subject.constructor.name)) {
          throw new InvalidSubjectException();
        }

        return 'Record';
      },
    });
  }

  public async defineAbilityToViewRecordsFor(currentUser: User): Promise<UserAbility> {
    const { build, can } = new AbilityBuilder<UserAbility>(PureAbility);

    can<TwitterRecord>('view', 'Record', ({ authorId }) => {
      return authorId === currentUser.id;
    });

    can<TwitterRecord>('view', 'Record', ({ privacySettings: { isHidden, usersExceptedFromViewingRules } }) => {
      return isHidden && usersExceptedFromViewingRules.some((user) => user.id === currentUser.id);
    });

    can<TwitterRecord>('view', 'Record', ({ privacySettings: { isHidden, usersExceptedFromViewingRules } }) => {
      return !isHidden && usersExceptedFromViewingRules.every((user) => user.id !== currentUser.id);
    });

    return build({
      conditionsMatcher: lambdaMatcher,
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
      detectSubjectType: <T extends Tweet | Comment | Retweet | TwitterRecord>(subject: T) => {
        const validSubjectsNames = ['Tweet', 'Comment', 'Retweet', 'TwitterRecord'];

        if (!validSubjectsNames.includes(subject.constructor.name)) {
          throw new InvalidSubjectException();
        }

        return 'Record';
      },
    });
  }

  public async currentUserCanViewUserRecordsOrThrow(currentUser: User, user: User): Promise<void> {
    const { areHidden, usersExceptedFromViewingRules } = await this.userRecordsPrivacyService.findUserRecordsPrivacySettings(user.id);

    let isCurrentUserAllowedToViewUserRecords: boolean;

    if (areHidden) {
      isCurrentUserAllowedToViewUserRecords = usersExceptedFromViewingRules.some((user) => user.id === currentUser.id);
    } else {
      isCurrentUserAllowedToViewUserRecords = usersExceptedFromViewingRules.every((user) => user.id !== currentUser.id);
    }

    if (!isCurrentUserAllowedToViewUserRecords) {
      throw new ActionForbiddenException();
    }
  }

  public async currentUserCanCommentOnUserRecordsOrThrow(currentUser: User, user: User): Promise<void> {
    const { isCommentingAllowed, usersExceptedFromCommentingRules } =
      await this.userRecordsPrivacyService.findUserRecordsPrivacySettings(user.id);

    let isCurrentUserAllowedToCommentOnUserRecords: boolean;

    if (isCommentingAllowed) {
      isCurrentUserAllowedToCommentOnUserRecords = usersExceptedFromCommentingRules.every((user) => user.id !== currentUser.id);
    } else {
      isCurrentUserAllowedToCommentOnUserRecords = usersExceptedFromCommentingRules.some((user) => user.id === currentUser.id);
    }

    if (!isCurrentUserAllowedToCommentOnUserRecords) {
      throw new ActionForbiddenException();
    }
  }
}
