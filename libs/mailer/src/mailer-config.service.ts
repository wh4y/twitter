import { Inject, Injectable } from '@nestjs/common';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

import { MAILER_MODULE_OPTIONS } from 'common/mailer/mailer.module-definition';

@Injectable()
export class MailerConfigService {
  constructor(@Inject(MAILER_MODULE_OPTIONS) private readonly options: MailerConfigOptions) {
    Object.assign(this, options);
  }

  public createNodemailerTransportOptions(): SMTPTransport.Options {
    return {
      host: this.options.host,
      port: +this.options.port,
      auth: {
        user: this.options.user,
        pass: this.options.password,
      },
    };
  }
}

export type MailerConfigOptions = {
  host: string;
  password: string;
  port: number;
  user: string;
};
