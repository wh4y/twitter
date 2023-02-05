import { UserFollowing } from '../../user-followings/entities/user-following.entity';
import { UserRecordsPrivacySettings } from '../../user-privacy/entities/user-records-privacy-settings.entity';
import { User } from '../../users/entities/user.entity';

export type DefineAbilityForCurrentUserOptions = {
  currentUser: User;
  target: User;
};

export type DefineAbilityToViewTargetUserRecordOptions = {
  followers: UserFollowing[];
};

export type TargetUserOptions = {
  targetUserId: string;
  followers: UserFollowing[];
  recordsPrivacySettings: UserRecordsPrivacySettings;
};
