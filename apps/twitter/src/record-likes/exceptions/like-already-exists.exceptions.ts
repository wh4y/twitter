export class LikeAlreadyExistsExceptions extends Error {
  constructor() {
    super('Like already exists!');
  }
}
