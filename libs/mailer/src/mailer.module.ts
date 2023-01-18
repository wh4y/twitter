import { Module } from '@nestjs/common';

import { MailerConfigService } from 'common/mailer/mailer-config.service';
import { ConfigurableMailerModule } from 'common/mailer/mailer.module-definition';
import { MailerService } from 'common/mailer/mailer.service';

@Module({
  providers: [MailerService, MailerConfigService],
  exports: [MailerService],
})
export class MailerModule extends ConfigurableMailerModule {}
