export class UserDoesntExistException extends Error {
  constructor() {
    super("User doesn't exist!");
  }
}
