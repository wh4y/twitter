import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFiles,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { AuthGuard } from 'common/auth';
import { CurrentUser } from 'common/auth/decorator/current-user.decorator';
import { UploadFilesInterceptor } from 'common/file';
import { Paginated, PaginationOptions } from 'common/pagination';

import { PermissionExceptionFilter } from '../../record-permissions/exception-filters/permission.exception-filter';
import { RecordContent } from '../../twitter-record/decorators/record-content.decorator';
import { RecordPaginationOptions } from '../../twitter-record/decorators/record-pagination-options.decorator';
import { EditRecordContentDto } from '../../twitter-record/dtos/edit-record-content.dto';
import { RecordContentDto } from '../../twitter-record/dtos/record-content.dto';
import { TwitterRecord } from '../../twitter-record/entities/twitter-record.entity';
import { RecordNotExistExceptionFilter } from '../../twitter-record/exception-filters/record-not-exist.exception-filter';
import { RecordImagesMapper } from '../../twitter-record/mappers/record-images.mapper';
import { User } from '../../users/entities/user.entity';
import { CommentService } from '../services/comment.service';

@UseFilters(PermissionExceptionFilter, RecordNotExistExceptionFilter)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('/comment')
export class CommentController {
  constructor(private readonly commentService: CommentService, private readonly recordImagesMapper: RecordImagesMapper) {}

  @UseGuards(AuthGuard)
  @UseInterceptors(UploadFilesInterceptor('images'))
  @Post('/:recordId')
  public async commentOnRecord(
    @Param('recordId') recordId: string,
    @RecordContent() dto: RecordContentDto,
    @CurrentUser() currentUser: User,
  ): Promise<TwitterRecord> {
    const images = this.recordImagesMapper.mapMulterFilesToTwitterRecordImageArray(dto.images);

    return this.commentService.commentOnRecord(recordId, { ...dto, images }, currentUser);
  }

  @UseGuards(AuthGuard)
  @Get('/record-comments/:recordId')
  public async getRecordComments(
    @Param('recordId') recordId: string,
    @RecordPaginationOptions() paginationOptions: PaginationOptions,
    @CurrentUser() currentUser: User,
  ): Promise<Paginated<TwitterRecord>> {
    return this.commentService.getDirectRecordCommentsByRecordId(recordId, paginationOptions, currentUser);
  }

  @UseGuards(AuthGuard)
  @Delete('/:commentId')
  public async deleteComment(@CurrentUser() currentUser: User, @Param('commentId') commentId: string): Promise<void> {
    await this.commentService.deleteComment(commentId, currentUser);
  }

  @UseInterceptors(UploadFilesInterceptor('newImages'))
  @UseGuards(AuthGuard)
  @Patch('/:commentId')
  public async editCommentContent(
    @CurrentUser() currentUser: User,
    @Param('commentId') commentId: string,
    @Body() dto: EditRecordContentDto,
    @UploadedFiles() newImages: Express.Multer.File[],
  ): Promise<TwitterRecord> {
    const images = this.recordImagesMapper.mapMulterFilesToTwitterRecordImageArray(newImages);

    return this.commentService.editCommentContent(commentId, { ...dto, newImages: images }, currentUser);
  }
}
