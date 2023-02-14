export type UpdateUserRecordsPrivacySettingsOptions = {
  areHidden?: boolean;
  areVisibleForFollowersOnly?: boolean;
  idsOfUsersExceptedFromCommentingRules?: string[];
  idsOfUsersExceptedFromViewingRules?: string[];
  isCommentingAllowed?: boolean;
};
