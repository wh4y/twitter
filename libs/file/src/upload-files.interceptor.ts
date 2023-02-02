import { NestInterceptor, Type } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

export const UploadFilesInterceptor = (fieldName: string): Type<NestInterceptor> =>
  FilesInterceptor(fieldName, 10, {
    storage: diskStorage({
      destination: './upload',
      filename: (req, file, cb) => {
        cb(null, file.originalname);
      },
    }),
  });
