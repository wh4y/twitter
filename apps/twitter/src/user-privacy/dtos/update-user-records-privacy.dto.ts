export class UpdateUserRecordsPrivacyDto {
  isCommentingAllowed?: boolean;
  areHidden?: boolean;
  areVisibleForFollowersOnly?: boolean;
  idsOfUsersExceptedFromCommentingRules?: string[];
  idsOfUsersExceptedFromViewingRules?: string[];
}
