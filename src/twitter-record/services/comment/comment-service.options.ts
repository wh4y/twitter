import { TwitterRecordImage } from '../../entities/twitter-record-image.entity';

export type CommentContentOptions = {
  authorId: string;
  images: TwitterRecordImage[];
  text: string;
};
