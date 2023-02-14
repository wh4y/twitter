import { TwitterRecordImage } from '../entities/twitter-record-image.entity';

export type RecordContent = {
  images?: TwitterRecordImage[];
  text?: string;
};
