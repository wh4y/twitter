import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Controller, Get } from '@nestjs/common';

import { UserDto } from '../dtos/user.dto';
import { User } from '../entities/user.entity';
import { UsersService } from '../services/users.service';

@Controller('/users')
export class UsersController {
  constructor(private readonly usersService: UsersService, @InjectMapper() private readonly mapper: Mapper) {}

  @Get('/all')
  public async getAllUsers(): Promise<UserDto[]> {
    const users = await this.usersService.getAllUsers();

    return this.mapper.mapArrayAsync(users, User, UserDto);
  }
}
