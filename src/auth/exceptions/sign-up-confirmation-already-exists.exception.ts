export class SignUpConfirmationAlreadyExistsException extends Error {
  constructor() {
    super('Sign-up confirmation already exists!');
  }
}
