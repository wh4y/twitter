import { ClassSerializerInterceptor, Controller, Get, UseInterceptors } from '@nestjs/common';

import { User } from '../entities/user.entity';
import { UsersService } from '../services/users.service';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/all')
  public async getAllUsers(): Promise<User[]> {
    return this.usersService.getAllUsers();
  }
}
