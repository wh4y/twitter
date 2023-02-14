export class UpdateRecordPrivacySettingsDto {
  isCommentingAllowed?: boolean;
  isHidden?: boolean;
  isVisibleForFollowersOnly?: boolean;
  idsOfUsersExceptedFromCommentingRules?: string[];
  idsOfUsersExceptedFromViewingRules?: string[];
}
