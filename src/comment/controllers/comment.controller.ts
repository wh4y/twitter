import { Controller, Delete, Get, Param, Patch, Post, UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';

import { AuthGuard } from 'common/auth';
import { CurrentUser } from 'common/auth/decorator/current-user.decorator';
import { UploadFilesInterceptor } from 'common/file';

import { PermissionExceptionFilter } from '../../record-permissions/exception-filters/permission.exception-filter';
import { TWEET_IMAGES_DESTINATION } from '../../tweet/constants/tweet-images-destination.constant';
import { RecordContent } from '../../twitter-record/decorators/record-content.decorator';
import { RecordContentDto } from '../../twitter-record/dtos/record-content.dto';
import { RecordImagesMapper } from '../../twitter-record/mappers/record-images.mapper';
import { User } from '../../users/entities/user.entity';
import { COMMENT_IMAGES_DESTINATION } from '../constants/comment-images-destination.constant';
import { Comment } from '../entities/comment.entity';
import { CommentService } from '../services/comment.service';

@UseFilters(PermissionExceptionFilter)
@Controller('/comment')
export class CommentController {
  constructor(private readonly commentService: CommentService, private readonly recordImagesMapper: RecordImagesMapper) {}

  @UseGuards(AuthGuard)
  @UseInterceptors(UploadFilesInterceptor('images', COMMENT_IMAGES_DESTINATION))
  @Post('/:recordId')
  public async commentOnRecord(
    @Param('recordId') recordId: string,
    @RecordContent() dto: RecordContentDto,
    @CurrentUser() currentUser: User,
  ): Promise<Comment> {
    const images = this.recordImagesMapper.mapMulterFilesToTwitterRecordImageArray(dto.images, COMMENT_IMAGES_DESTINATION);

    return this.commentService.commentOnRecord(recordId, { ...dto, images }, currentUser);
  }

  @Get('/record-comments-trees/:recordId')
  public async getRecordCommentsTrees(@Param('recordId') recordId: string): Promise<Comment[]> {
    return this.commentService.getRecordCommentsTrees(recordId);
  }

  @UseGuards(AuthGuard)
  @Delete('/:commentId')
  public async deleteComment(@CurrentUser() currentUser: User, @Param('commentId') commentId: string): Promise<void> {
    await this.commentService.deleteComment(commentId, currentUser);
  }

  @UseInterceptors(UploadFilesInterceptor('images', COMMENT_IMAGES_DESTINATION))
  @UseGuards(AuthGuard)
  @Patch('/:commentId')
  public async editTweetContent(
    @CurrentUser() currentUser: User,
    @Param('commentId') commentId: string,
    @RecordContent() dto: RecordContentDto,
  ): Promise<Comment> {
    const images = this.recordImagesMapper.mapMulterFilesToTwitterRecordImageArray(dto.images, TWEET_IMAGES_DESTINATION);

    return this.commentService.editCommentContent(commentId, { ...dto, images }, currentUser);
  }
}
