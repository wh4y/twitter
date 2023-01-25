export type UpdateRecordPrivacySettingsOptions = {
  isCommentingAllowed?: boolean;
  isHidden?: boolean;
  idsOfUsersExceptedFromCommentingRules?: string[];
  idsOfUsersExceptedFromViewingRules?: string[];
};
