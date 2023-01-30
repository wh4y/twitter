import { Body, Controller, Param, Patch, UseGuards } from '@nestjs/common';

import { AuthGuard } from 'common/auth';
import { CurrentUser } from 'common/auth/decorator/current-user.decorator';

import { User } from '../../users/entities/user.entity';
import { UpdateRecordPrivacySettingsDto } from '../dtos/update-record-privacy-settings.dto';
import { RecordsPrivacyService } from '../services/records-privacy.service';

@Controller('/records-privacy')
export class RecordsPrivacyController {
  constructor(private readonly recordsPrivacyService: RecordsPrivacyService) {}

  @UseGuards(AuthGuard)
  @Patch('/:recordId')
  public async updateRecordPrivacySettings(
    @Param('recordId') recordId: string,
    @Body() dto: UpdateRecordPrivacySettingsDto,
    @CurrentUser() currentUser: User,
  ) {
    await this.recordsPrivacyService.updateRecordPrivacySettings(recordId, dto, currentUser);
  }
}
