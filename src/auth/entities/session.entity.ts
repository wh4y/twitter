import * as uuid from 'uuid';

import { SESSION_TTL_IN_MILLISECONDS } from '../constants/session-ttl.constant';

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
    this.expiredAt = new Date(currentDate.getTime() + SESSION_TTL_IN_MILLISECONDS);

    Object.assign(this, partialEntity);
  }
}
