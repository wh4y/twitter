import { ConfigurableModuleBuilder } from '@nestjs/common';

import { MailerConfigOptions } from 'common/mailer/mailer-config.service';

export const { ConfigurableModuleClass: ConfigurableMailerModule, MODULE_OPTIONS_TOKEN: MAILER_MODULE_OPTIONS } =
  new ConfigurableModuleBuilder<MailerConfigOptions>().build();
