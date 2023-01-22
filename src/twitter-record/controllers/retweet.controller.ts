import { Controller, Param, Post, UseGuards, UseInterceptors } from '@nestjs/common';

import { AuthGuard } from 'common/auth';
import { CurrentUser } from 'common/auth/decorator/current-user.decorator';
import { UploadFilesInterceptor } from 'common/file';

import { User } from '../../users/entities/user.entity';
import { RETWEET_IMAGES_DESTINATION } from '../constants/retweet-images-destination.constant';
import { RecordContent } from '../decorators/record-content.decorator';
import { RecordContentDto } from '../dtos/record-content.dto';
import { Retweet } from '../entities/retweet.entity';
import { RecordImagesMapper } from '../mappers/record-images.mapper';
import { RetweetService } from '../services/retweet/retweet.service';

@Controller('/retweet')
export class RetweetController {
  constructor(private readonly retweetService: RetweetService, private readonly recordImagesMapper: RecordImagesMapper) {}

  @UseInterceptors(UploadFilesInterceptor('images', RETWEET_IMAGES_DESTINATION))
  @UseGuards(AuthGuard)
  @Post('/:tweetId')
  public async retweet(
    @Param('tweetId') tweetId: string,
    @RecordContent() dto: RecordContentDto,
    @CurrentUser() { id: userId }: User,
  ): Promise<Retweet> {
    const images = this.recordImagesMapper.mapMulterFilesToTwitterRecordImageArray(dto.images, RETWEET_IMAGES_DESTINATION);

    return this.retweetService.retweet(tweetId, userId, { ...dto, images });
  }
}
