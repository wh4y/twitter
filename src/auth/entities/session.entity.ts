import * as uuid from 'uuid';

export class Session {
  public readonly id: string;
  public readonly userId: string;
  public readonly userAgent: string;
  public readonly ip: string;
  public readonly createdAt: Date;
  public readonly expiredAt: Date;

  constructor(partialEntity: Partial<Session>) {
    this.id = uuid.v4();

    const currentDate = new Date();

    this.createdAt = currentDate;
    this.expiredAt = new Date(currentDate.getTime());

    this.expiredAt.setMinutes(currentDate.getMinutes() + 5);

    Object.assign(this, partialEntity);
  }
}
