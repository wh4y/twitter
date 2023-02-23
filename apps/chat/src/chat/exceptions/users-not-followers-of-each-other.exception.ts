export class UsersNotFollowersOfEachOtherException extends Error {
  constructor() {
    super('Users are not followers of each other!');
  }
}
