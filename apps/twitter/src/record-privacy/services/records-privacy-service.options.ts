export type UpdateRecordPrivacySettingsOptions = {
  isCommentingAllowed?: boolean;
  isHidden?: boolean;
  isVisibleForFollowersOnly?: boolean;
  idsOfUsersExceptedFromCommentingRules?: string[];
  idsOfUsersExceptedFromViewingRules?: string[];
};
