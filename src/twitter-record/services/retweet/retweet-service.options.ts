import { TwitterRecordImage } from '../../entities/twitter-record-image.entity';

export type RetweetOptions = {
  authorId: string;
  images: TwitterRecordImage[];
  text: string;
};
