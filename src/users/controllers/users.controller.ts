import { Controller, Get } from '@nestjs/common';

import { User } from '../entities/user.entity';
import { UsersService } from '../services/users.service';

@Controller('/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/all')
  public async getAllUsers(): Promise<User[]> {
    return this.usersService.getAllUsers();
  }
}
