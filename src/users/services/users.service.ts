import { Injectable } from '@nestjs/common';

import { User } from '../entities/user';
import { UserAlreadyExistsException } from '../exceptions/user-already-exists.exception';
import { UsersRepository } from '../repositories/users.repository';

import { AddNewUserOptions } from './users-service.options';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  public async addNewUser(options: AddNewUserOptions): Promise<User> {
    const doesUserAlreadyExist = await this.usersRepository.checkIfUserAlreadyExistsByEmail(options.email);

    if (doesUserAlreadyExist) {
      throw new UserAlreadyExistsException();
    }

    const user = new User({ ...options });

    await this.usersRepository.save(user);

    return user;
  }

  public async getAllUsers(): Promise<User[]> {
    return this.usersRepository.findAll();
  }
}
