export class ActionForbiddenException extends Error {
  constructor() {
    super('Action forbidden!');
  }
}
