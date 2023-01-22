import { Controller, Get, Param, Post, UseGuards, UseInterceptors } from '@nestjs/common';

import { AuthGuard } from 'common/auth';
import { CurrentUser } from 'common/auth/decorator/current-user.decorator';
import { UploadFilesInterceptor } from 'common/file';

import { RecordContent } from '../decorators/record-content.decorator';
import { RecordContentDto } from '../dtos/record-content.dto';
import { RecordImagesMapper } from '../mappers/record-images.mapper';
import { User } from '../../users/entities/user.entity';
import { COMMENT_IMAGES_DESTINATION } from '../constants/comment-images-destination.constant';
import { Comment } from '../entities/comment.entity';
import { CommentService } from '../services/comment/comment.service';

@Controller('/comment')
export class CommentController {
  constructor(private readonly commentService: CommentService, private readonly recordImagesMapper: RecordImagesMapper) {}

  @UseGuards(AuthGuard)
  @UseInterceptors(UploadFilesInterceptor('images', COMMENT_IMAGES_DESTINATION))
  @Post('/comment-on-record/:recordId')
  public async commentOnRecord(
    @Param('recordId') recordId: string,
    @RecordContent() dto: RecordContentDto,
    @CurrentUser() { id: userId }: User,
  ): Promise<Comment> {
    const images = this.recordImagesMapper.mapMulterFilesToTwitterRecordImageArray(dto.images, COMMENT_IMAGES_DESTINATION);

    return this.commentService.commentOnRecord(recordId, { ...dto, authorId: userId, images });
  }

  @Get('/record-comments-trees/:recordId')
  public async getRecordCommentsTrees(@Param('recordId') recordId: string): Promise<Comment[]> {
    return this.commentService.getRecordCommentsTrees(recordId);
  }
}
