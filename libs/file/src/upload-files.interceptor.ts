import { NestInterceptor, Type } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as uuid from 'uuid';

export const UploadFilesInterceptor = (fieldName: string, destination: string): Type<NestInterceptor> =>
  FilesInterceptor(fieldName, 10, {
    storage: diskStorage({
      destination: './upload' + destination,
      filename: (req, file, cb) => {
        const filename = path.parse(file.originalname).name.replace(/\s/g, '') + '_' + uuid.v4();

        file.filename;
        const extension = path.parse(file.originalname).ext;

        cb(null, `${filename}${extension}`);
      },
    }),
  });
