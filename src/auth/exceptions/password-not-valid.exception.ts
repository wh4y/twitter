export class PasswordNotValidException extends Error {
  constructor() {
    super("Password isn't valid!");
  }
}
