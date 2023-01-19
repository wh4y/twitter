import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class RefreshToken {
  @Column({
    type: 'varchar',
  })
  value: string;

  @Column({
    type: 'uuid',
    nullable: false,
  })
  userId: string;

  @PrimaryColumn({
    type: 'uuid',
    nullable: false,
  })
  sessionId: string;

  @Column({
    type: 'timestamp',
  })
  createdAt: Date;

  constructor(partialEntity: Partial<RefreshToken>) {
    Object.assign(this, partialEntity);
  }
}
