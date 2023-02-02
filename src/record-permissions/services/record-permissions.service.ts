import { AbilityBuilder, AbilityTuple, createMongoAbility, MatchConditions, MongoAbility, PureAbility } from '@casl/ability';
import { Injectable } from '@nestjs/common';

import { Retweet } from '../../retweet/entities/retweet.entity';
import { Tweet } from '../../tweet/entities/tweet.entity';
import { TwitterRecord } from '../../twitter-record/entities/twitter-record.entity';
import { UserFollowingsService } from '../../user-followings/services/user-followings.service';
import { UserRecordsPrivacyService } from '../../user-privacy/services/user-records-privacy.service';
import { User } from '../../users/entities/user.entity';
import { ActionForbiddenException } from '../exceptions/action-forbidden.exception';
import { InvalidSubjectException } from '../exceptions/invalid-subject.exception';

import { DefineAbilityForCurrentUserOptions } from './record-permissions-service.options';

type UserAbility = PureAbility<AbilityTuple, MatchConditions>;
const lambdaMatcher = (matchConditions: MatchConditions) => matchConditions;

@Injectable()
export class RecordPermissionsService {
  constructor(
    private readonly userRecordsPrivacyService: UserRecordsPrivacyService,
    private readonly userFollowingsService: UserFollowingsService,
  ) {}

  public async defineCurrentUserAbilityToCommentOnUserRecords({
    currentUser,
    target,
  }: DefineAbilityForCurrentUserOptions): Promise<UserAbility> {
    const { isCommentingAllowed, usersExceptedFromCommentingRules } =
      await this.userRecordsPrivacyService.findUserRecordsPrivacySettings(target.id);

    let isCurrentUserAllowedToCommentOnUserRecords: boolean;

    if (isCommentingAllowed) {
      isCurrentUserAllowedToCommentOnUserRecords = usersExceptedFromCommentingRules.every((user) => user.id !== currentUser.id);
    } else {
      isCurrentUserAllowedToCommentOnUserRecords = usersExceptedFromCommentingRules.some((user) => user.id === currentUser.id);
    }

    if (!isCurrentUserAllowedToCommentOnUserRecords) {
      throw new ActionForbiddenException();
    }

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

  public async defineCurrentUserAbilityToViewUserRecords({
    currentUser,
    target,
  }: DefineAbilityForCurrentUserOptions): Promise<UserAbility> {
    const followers = await this.userFollowingsService.getUserFollowers(target.id);

    const { areHidden, areVisibleForFollowersOnly, usersExceptedFromViewingRules } =
      await this.userRecordsPrivacyService.findUserRecordsPrivacySettings(target.id);

    const isCurrentUserAuthor = currentUser.id === target.id;
    const isCurrentUserFollower = followers.some((follower) => follower.followerId === currentUser.id);

    if (!isCurrentUserFollower && areVisibleForFollowersOnly && !isCurrentUserAuthor) {
      throw new ActionForbiddenException();
    }

    let isCurrentUserAllowedToViewUserRecords: boolean;

    if (areHidden) {
      isCurrentUserAllowedToViewUserRecords = usersExceptedFromViewingRules.some((user) => user.id === currentUser.id);
    } else {
      isCurrentUserAllowedToViewUserRecords = usersExceptedFromViewingRules.every((user) => user.id !== currentUser.id);
    }

    if (!isCurrentUserAllowedToViewUserRecords && !isCurrentUserAuthor) {
      throw new ActionForbiddenException();
    }

    const { build, can } = new AbilityBuilder<UserAbility>(PureAbility);

    can<TwitterRecord>('view', 'Record', ({ authorId }) => {
      return authorId === currentUser.id;
    });

    can<TwitterRecord>(
      'view',
      'Record',
      ({ privacySettings: { isHidden, isVisibleForFollowersOnly, usersExceptedFromViewingRules } }) => {
        const isCurrentUserFollower = followers.some((follower) => follower.followerId === currentUser.id);
        const isCurrentUserExceptedOne = usersExceptedFromViewingRules.some((user) => user.id === currentUser.id);

        return isVisibleForFollowersOnly && isCurrentUserFollower && isHidden && isCurrentUserExceptedOne;
      },
    );

    can<TwitterRecord>(
      'view',
      'Record',
      ({ privacySettings: { isHidden, isVisibleForFollowersOnly, usersExceptedFromViewingRules } }) => {
        const isCurrentUserFollower = followers.some((follower) => follower.followerId === currentUser.id);
        const isCurrentUserNotExceptedOne = usersExceptedFromViewingRules.every((user) => user.id !== currentUser.id);

        return isVisibleForFollowersOnly && isCurrentUserFollower && !isHidden && isCurrentUserNotExceptedOne;
      },
    );

    can<TwitterRecord>(
      'view',
      'Record',
      ({ privacySettings: { isHidden, isVisibleForFollowersOnly, usersExceptedFromViewingRules } }) => {
        const isCurrentUserExceptedOne = usersExceptedFromViewingRules.some((user) => user.id === currentUser.id);

        return !isVisibleForFollowersOnly && isHidden && isCurrentUserExceptedOne;
      },
    );

    can<TwitterRecord>(
      'view',
      'Record',
      ({ privacySettings: { isHidden, isVisibleForFollowersOnly, usersExceptedFromViewingRules } }) => {
        const isCurrentUserNotExceptedOne = usersExceptedFromViewingRules.every((user) => user.id !== currentUser.id);

        return !isVisibleForFollowersOnly && !isHidden && isCurrentUserNotExceptedOne;
      },
    );

    return build({
      conditionsMatcher: lambdaMatcher,
      detectSubjectType: <T extends Tweet | Comment | Retweet>(subject: T) => {
        const validSubjectsNames = ['Tweet', 'Comment', 'Retweet', 'RetweetedRecord', 'Quote', 'QuotedRecord'];

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
        const validSubjectsNames = ['Tweet', 'Comment', 'Retweet', 'Quote', 'TwitterRecord'];

        if (!validSubjectsNames.includes(subject.constructor.name)) {
          throw new InvalidSubjectException();
        }

        return 'Record';
      },
    });
  }
}
