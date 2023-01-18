import { AutoMap } from '@automapper/classes';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @AutoMap()
  @PrimaryGeneratedColumn('uuid')
  public readonly id: string;

  @AutoMap()
  @Column({
    type: 'varchar',
    nullable: false,
    unique: true,
  })
  public name: string;

  @AutoMap()
  @Column({
    type: 'varchar',
    nullable: false,
    unique: true,
  })
  public email: string;

  @AutoMap()
  @Column({
    type: 'varchar',
    nullable: false,
  })
  public password: string;

  constructor(partialEntity: Partial<User>) {
    Object.assign(this, partialEntity);
  }
}
