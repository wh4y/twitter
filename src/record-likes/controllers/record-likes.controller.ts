import { Controller, Delete, Param, Post, UseFilters, UseGuards } from '@nestjs/common';

import { AuthGuard } from 'common/auth';
import { CurrentUser } from 'common/auth/decorator/current-user.decorator';

import { RecordNotExistExceptionFilter } from '../../twitter-record/exception-filters/record-not-exist.exception-filter';
import { User } from '../../users/entities/user.entity';
import { RecordLike } from '../entities/record-like.entity';
import { RecordLikesExceptionFilter } from '../exception-filters/record-likes.exception-filter';
import { RecordLikesService } from '../services/record-likes.service';

@UseFilters(RecordLikesExceptionFilter)
@Controller('/record-likes')
export class RecordLikesController {
  constructor(private readonly recordLikesService: RecordLikesService) {}

  @UseFilters(RecordNotExistExceptionFilter)
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
