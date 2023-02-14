export class InvalidConfirmationCodeException extends Error {
  constructor() {
    super('Invalid confirmation code!');
  }
}
