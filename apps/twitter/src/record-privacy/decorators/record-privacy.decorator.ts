import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { UpdateRecordPrivacySettingsDto } from '../dtos/update-record-privacy-settings.dto';

export const RecordPrivacy = createParamDecorator((data: string, ctx: ExecutionContext): UpdateRecordPrivacySettingsDto => {
  const request = ctx.switchToHttp().getRequest<TypedRequest>();

  return request.body.privacySettings;
});
