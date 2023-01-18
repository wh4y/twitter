import { Controller, Get } from '@nestjs/common';

import { UserEntity } from '../entities/user.entity';
import { UsersService } from '../services/users.service';

@Controller('/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/all')
  public async getAllUsers(): Promise<UserEntity[]> {
    return this.usersService.getAllUsers();
  }
}
