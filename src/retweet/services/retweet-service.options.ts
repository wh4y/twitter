import { TwitterRecordImage } from '../../twitter-record/entities/twitter-record-image.entity';

export type RetweetOptions = {
  authorId: string;
  images?: TwitterRecordImage[];
  text?: string;
};

export type EditRetweetOptions = {
  images?: TwitterRecordImage[];
  text?: string;
};
