export class RecordPrivacySettingsDto {
  isCommentingAllowed?: boolean;
  isHidden?: boolean;
  idsOfUsersExceptedFromCommentingRules?: string[];
  idsOfUsersExceptedFromViewingRules?: string[];
}
