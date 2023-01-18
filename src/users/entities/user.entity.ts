import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  public readonly id: string;

  @Column({
    type: 'varchar',
    nullable: false,
    unique: true,
  })
  public name: string;

  @Column({
    type: 'varchar',
    nullable: false,
    unique: true,
  })
  public email: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  public password: string;

  constructor(partialEntity: Partial<User>) {
    Object.assign(this, partialEntity);
  }
}
