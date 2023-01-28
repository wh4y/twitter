export class FollowingAlreadyExistsException extends Error {
  constructor() {
    super('Following already exists!');
  }
}
