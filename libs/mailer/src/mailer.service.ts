import { Injectable } from '@nestjs/common';
import { createTransport } from 'nodemailer';
import * as Mail from 'nodemailer/lib/mailer';

import { MailerConfigService } from 'common/mailer/mailer-config.service';

@Injectable()
export class MailerService {
  private readonly nodemailerTransport: Mail;

  constructor(private readonly configService: MailerConfigService) {
    const options = configService.createNodemailerTransportOptions();

    this.nodemailerTransport = createTransport(options);
  }

  public async sendMail(options: Mail.Options): Promise<void> {
    await this.nodemailerTransport.sendMail(options);
  }
}
