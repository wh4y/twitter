export class Session {
  public readonly id: string;
  public readonly userId: string;
  public readonly userAgent: string;
  public readonly ip: string;
  public readonly createdAt: Date;
  public readonly expiredAt: Date;

  constructor(partialEntity: Partial<Session>) {
    Object.assign(this, partialEntity);
  }
}
