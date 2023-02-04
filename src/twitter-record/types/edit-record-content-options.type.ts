import { TwitterRecordImage } from '../entities/twitter-record-image.entity';

export type EditRecordContentOptions = {
  idsOfImagesToBeSaved?: string[];
  newImages?: TwitterRecordImage[];
  text?: string;
};
