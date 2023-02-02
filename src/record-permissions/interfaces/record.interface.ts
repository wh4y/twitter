import { RecordPrivacySettings } from '../../record-privacy/entities/record-privacy-settings.entity';

export interface Record {
  authorId: string;
  id: string;
  privacySettings: RecordPrivacySettings;
}
