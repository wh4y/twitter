export class UserAlreadyExistsException extends Error {
  constructor() {
    super('UserEntity already exists!');
  }
}
