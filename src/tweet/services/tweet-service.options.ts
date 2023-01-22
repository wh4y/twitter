import { BaseRecordImage } from '../../twitter-record/entities/base-record-image.entity';

export type PostTweetOptions = {
  authorId: string;
  images: BaseRecordImage[];
  text: string;
};
