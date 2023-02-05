import { AbilityBuilder, AbilityTuple, createMongoAbility, MatchConditions, MongoAbility, PureAbility } from '@casl/ability';
import { Injectable } from '@nestjs/common';

import { TwitterRecord } from '../../twitter-record/entities/twitter-record.entity';
import { UserFollowingsService } from '../../user-followings/services/user-followings.service';
import { UserRecordsPrivacyService } from '../../user-privacy/services/user-records-privacy.service';
import { User } from '../../users/entities/user.entity';
import { ActionForbiddenException } from '../exceptions/action-forbidden.exception';
import { InvalidSubjectException } from '../exceptions/invalid-subject.exception';
import { UnexpectedRecordAuthorException } from '../exceptions/unexpected-record-author.exception';
import { Record } from '../interfaces/record.interface';

import {
  DefineAbilityForCurrentUserOptions,
  DefineAbilityToViewTargetUserRecordOptions,
  TargetUserOptions,
} from './record-permissions-service.options';

type UserAbility = PureAbility<AbilityTuple, MatchConditions>;
const lambdaMatcher = (matchConditions: MatchConditions) => matchConditions;

@Injectable()
export class RecordPermissionsService {
  constructor(
    private readonly userRecordsPrivacyService: UserRecordsPrivacyService,
    private readonly userFollowingsService: UserFollowingsService,
  ) {}

  public async defineCurrentUserAbilityToCommentOnUserRecordsOrThrow({
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
      detectSubjectType: <T extends Record>(subject: T) => {
        const validSubjectsNames = ['Tweet', 'Comment', 'Retweet', 'TwitterRecord'];

        if (!validSubjectsNames.includes(subject.constructor.name)) {
          throw new InvalidSubjectException();
        }

        if (subject.authorId !== target.id) {
          throw new UnexpectedRecordAuthorException();
        }

        return 'Record';
      },
    });
  }

  private defineAbilityToViewRecordsOfTargetUserForCurrentUser(
    { followers }: DefineAbilityToViewTargetUserRecordOptions,
    currentUser: User,
  ): UserAbility {
    const { build, can } = new AbilityBuilder<UserAbility>(PureAbility);

    // can<TwitterRecord>('view', 'Record', ({ authorId }) => {
    //   return authorId === currentUser.id;
    // });

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
      detectSubjectType: <T extends Record>(subject: T) => {
        const validSubjectsNames = ['Tweet', 'Comment', 'Retweet', 'RetweetedRecord', 'Quote', 'QuotedRecord'];

        if (!validSubjectsNames.includes(subject.constructor.name)) {
          throw new InvalidSubjectException();
        }

        return 'Record';
      },
    });
  }

  private checkIfCurrentUserCanViewTargetUserRecords(
    currentUser: User,
    { followers, recordsPrivacySettings, targetUserId }: TargetUserOptions,
  ): boolean {
    const isCurrentUserAuthor = currentUser.id === targetUserId;

    // if (isCurrentUserAuthor) {
    //   return true;
    // }

    const { areHidden, areVisibleForFollowersOnly, usersExceptedFromViewingRules } = recordsPrivacySettings;

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

    return isCurrentUserAllowedToViewUserRecords;
  }

  public async defineCurrentUserAbilityToViewUserRecordsOrThrow({
    currentUser,
    target,
  }: DefineAbilityForCurrentUserOptions): Promise<UserAbility> {
    const followers = await this.userFollowingsService.getUserFollowers(target.id);

    const recordsPrivacySettings = await this.userRecordsPrivacyService.findUserRecordsPrivacySettings(target.id);

    const isCurrentUserAllowedToViewUserRecords = this.checkIfCurrentUserCanViewTargetUserRecords(currentUser, {
      followers,
      targetUserId: target.id,
      recordsPrivacySettings,
    });

    if (!isCurrentUserAllowedToViewUserRecords) {
      throw new ActionForbiddenException();
    }

    const ability = this.defineAbilityToViewRecordsOfTargetUserForCurrentUser({ followers }, currentUser);

    return ability;
  }

  public async getRecordsAvailabilityCheckerFor(currentUser: User): Promise<any> {
    const cachedTargetUserOptions = new Map<string, TargetUserOptions>();

    const checker = async function (this: RecordPermissionsService, record: Record): Promise<boolean> {
      const targetUserId = record.authorId;

      let targetUserOptions = cachedTargetUserOptions.get(targetUserId);

      if (!targetUserOptions) {
        const targetUserFollowers = await this.userFollowingsService.getUserFollowers(targetUserId);
        const targetUserRecordsPrivacySettings = await this.userRecordsPrivacyService.findUserRecordsPrivacySettings(targetUserId);

        console.log(cachedTargetUserOptions.has(targetUserId));
        targetUserOptions = { targetUserId, recordsPrivacySettings: targetUserRecordsPrivacySettings, followers: targetUserFollowers };

        cachedTargetUserOptions.set(targetUserId, targetUserOptions);
      }

      const canCurrentUserViewTargetUserRecords = this.checkIfCurrentUserCanViewTargetUserRecords(currentUser, {
        targetUserId,
        followers: targetUserOptions.followers,
        recordsPrivacySettings: targetUserOptions.recordsPrivacySettings,
      });

      const abilityToViewRecords = this.defineAbilityToViewRecordsOfTargetUserForCurrentUser(
        { followers: targetUserOptions.followers },
        currentUser,
      );

      const canCurrentUserViewRecord = abilityToViewRecords.can('view', record);

      return canCurrentUserViewTargetUserRecords && canCurrentUserViewRecord;
    };

    return checker.bind(this);
  }

  public async canCurrentUserViewRecord(currentUser: User, record: Record): Promise<boolean> {
    try {
      const abilityToViewUserRecords = await this.defineCurrentUserAbilityToViewUserRecordsOrThrow({
        currentUser,
        target: { id: record.authorId } as User,
      });

      return abilityToViewUserRecords.can('view', record);
    } catch (e) {
      if (e instanceof ActionForbiddenException) {
        return false;
      }

      throw e;
    }
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
      detectSubjectType: <T extends Record>(subject: T) => {
        const validSubjectsNames = ['Tweet', 'Comment', 'Retweet', 'Quote', 'TwitterRecord'];

        if (!validSubjectsNames.includes(subject.constructor.name)) {
          throw new InvalidSubjectException();
        }

        return 'Record';
      },
    });
  }
}
