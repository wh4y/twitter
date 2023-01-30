import { Controller, Delete, Param, Post, UseGuards } from '@nestjs/common';

import { AuthGuard } from 'common/auth';
import { CurrentUser } from 'common/auth/decorator/current-user.decorator';

import { User } from '../../users/entities/user.entity';
import { RecordLike } from '../entities/record-like.entity';
import { RecordLikesService } from '../services/record-likes.service';

@Controller('/record-likes')
export class RecordLikesController {
  constructor(private readonly recordLikesService: RecordLikesService) {}

  @UseGuards(AuthGuard)
  @Post('/:recordId')
  public async likeRecord(@Param('recordId') recordId: string, @CurrentUser() currentUser: User): Promise<RecordLike> {
    return this.recordLikesService.likeRecord({ recordId, userId: currentUser.id });
  }

  @UseGuards(AuthGuard)
  @Delete('/:recordId')
  public async removeLikeFromRecord(@Param('recordId') recordId: string, @CurrentUser() currentUser: User): Promise<void> {
    await this.recordLikesService.removeLikeFormRecord({ recordId, userId: currentUser.id });
  }
}
