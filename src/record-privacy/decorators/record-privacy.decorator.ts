import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { RecordPrivacySettingsDto } from '../dtos/record-privacy-settings.dto';

export const RecordPrivacy = createParamDecorator((data: string, ctx: ExecutionContext): RecordPrivacySettingsDto => {
  const request = ctx.switchToHttp().getRequest<TypedRequest>();

  return request.body.privacySettings;
});
