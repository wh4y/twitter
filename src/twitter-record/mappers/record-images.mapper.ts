import { Injectable } from '@nestjs/common';

import { TwitterRecordImage } from '../entities/twitter-record-image.entity';

@Injectable()
export class RecordImagesMapper {
  public mapMulterFilesToTwitterRecordImageArray(files: Express.Multer.File[], basePath: string): TwitterRecordImage[] {
    return files.map((file) => new TwitterRecordImage({ name: file.originalname, path: basePath + file.filename }));
  }
}
