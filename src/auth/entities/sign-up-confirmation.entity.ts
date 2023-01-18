export class SignUpConfirmation {
  public readonly code: number;
  public readonly email: string;
  public readonly hashedPassword: string;
  public readonly username: string;

  constructor(partialEntity: Partial<SignUpConfirmation>) {
    Object.assign(this, partialEntity);
  }
}
