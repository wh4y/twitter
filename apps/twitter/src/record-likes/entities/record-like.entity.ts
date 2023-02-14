import { CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

import { TwitterRecord } from '../../twitter-record/entities/twitter-record.entity';
import { User } from '../../users/entities/user.entity';

@Entity()
export class RecordLike {
  @PrimaryColumn({
    type: 'uuid',
  })
  recordId: string;

  @ManyToOne(() => TwitterRecord, { onDelete: 'CASCADE' })
  @JoinColumn()
  record: TwitterRecord;

  @PrimaryColumn({
    type: 'uuid',
  })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @CreateDateColumn({
    type: 'timestamp',
  })
  createdAt: Date;

  constructor(partialEntity: Partial<RecordLike>) {
    Object.assign(this, partialEntity);
  }
}
