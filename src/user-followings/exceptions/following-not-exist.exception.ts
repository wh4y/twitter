export class FollowingNotExistException extends Error {
  constructor() {
    super("Following doesn't exist!");
  }
}
