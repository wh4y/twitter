export class SignUpConfirmationNotExistException extends Error {
  constructor() {
    super("Sign-up confirmation hasn't been found!");
  }
}
