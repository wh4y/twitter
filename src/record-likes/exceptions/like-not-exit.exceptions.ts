export class LikeNotExitExceptions extends Error {
  constructor() {
    super("Like doesn't exist!");
  }
}
