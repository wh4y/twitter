export class CurrentUserNotAdminException extends Error {
  constructor() {
    super('Current user is not admin!');
  }
}
