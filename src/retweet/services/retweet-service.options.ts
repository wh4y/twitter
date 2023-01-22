import { TwitterRecordImage } from '../../twitter-record/entities/twitter-record-image.entity';

export type RetweetContent = {
  images: TwitterRecordImage[];
  text: string;
};
