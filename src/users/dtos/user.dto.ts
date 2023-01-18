import { AutoMap } from '@automapper/classes';

export class UserDto {
  @AutoMap()
  id: string;

  @AutoMap()
  email: string;

  @AutoMap()
  name: string;
}
