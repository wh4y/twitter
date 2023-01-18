import { createMap, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';

import { UserDto } from '../dtos/user.dto';
import { User } from '../entities/user.entity';

export class UsersMapperProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  public override get profile() {
    return (mapper) => {
      createMap(mapper, User, UserDto);
    };
  }
}
