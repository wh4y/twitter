import { TwitterRecordImage } from '../../twitter-record/entities/twitter-record-image.entity';

export type PostTweetOptions = {
  authorId: string;
  images: TwitterRecordImage[];
  text: string;
};
