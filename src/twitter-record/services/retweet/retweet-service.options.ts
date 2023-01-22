import { TwitterRecordImage } from '../../entities/twitter-record-image.entity';

export type RetweetContent = {
  images: TwitterRecordImage[];
  text: string;
};
