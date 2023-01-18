import { Injectable } from '@nestjs/common';

import { User } from '../entities/user.entity';
import { UserAlreadyExistsException } from '../exceptions/user-already-exists.exception';
import { UsersRepository } from '../repositories/users.repository';

import { AddNewUserOptions } from './users-service.options';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  public async addNewUser(options: AddNewUserOptions): Promise<User> {
    const doesUserAlreadyExist = await this.usersRepository.checkIfUserExistsByEmail(options.email);

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

  public async doesUserExistByEmail(email: string): Promise<boolean> {
    return this.usersRepository.checkIfUserExistsByEmail(email);
  }
}
