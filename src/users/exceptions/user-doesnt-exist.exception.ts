export class UserDoesntExistException extends Error {
  constructor() {
    super("UserEntity doesn't exist!");
  }
}
