import { Body, Controller, Param, Patch, UseGuards } from '@nestjs/common';

import { AuthGuard } from 'common/auth';
import { CurrentUser } from 'common/auth/decorator/current-user.decorator';

import { User } from '../../users/entities/user.entity';
import { UpdateUserRecordsPrivacyDto } from '../dtos/update-user-records-privacy.dto';
import { UserRecordsPrivacyService } from '../services/user-records-privacy.service';

@Controller('/user-privacy')
export class UserPrivacyController {
  constructor(private readonly userRecordsPrivacyService: UserRecordsPrivacyService) {}

  @UseGuards(AuthGuard)
  @Patch('/:userId/records')
  public async updateUserRecordsPrivacySettings(
    @Param('userId') userId: string,
    @Body() dto: UpdateUserRecordsPrivacyDto,
    @CurrentUser() currentUser: User,
  ): Promise<void> {
    await this.userRecordsPrivacyService.updateUserRecordsPrivacySettings(userId, { ...dto }, currentUser);
  }
}
