import { Injectable } from '@nestjs/common';

import { UserRecordsPrivacyService } from '../../user-privacy/services/user-records-privacy.service';
import { User } from '../entities/user.entity';
import { UserAlreadyExistsException } from '../exceptions/user-already-exists.exception';
import { UsersRepository } from '../repositories/users.repository';

import { AddNewUserOptions } from './users-service.options';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository, private readonly userPrivacyService: UserRecordsPrivacyService) {}

  public async addNewUser(options: AddNewUserOptions): Promise<User> {
    const doesUserAlreadyExist = await this.usersRepository.checkIfUserExistsByEmail(options.email);

    if (doesUserAlreadyExist) {
      throw new UserAlreadyExistsException();
    }

    const user = new User({ ...options });

    await this.usersRepository.save(user);

    await this.userPrivacyService.defineDefaultUserRecordsPrivacySettingsForUser(user.id);

    return user;
  }

  public async getAllUsers(): Promise<User[]> {
    return this.usersRepository.findAll();
  }

  public async getUserById(id: string): Promise<User> {
    return this.usersRepository.findUserById(id);
  }

  public async doesUserExistByEmail(email: string): Promise<boolean> {
    return this.usersRepository.checkIfUserExistsByEmail(email);
  }

  public async findUserByEmail(email: string): Promise<User> {
    return this.usersRepository.findUserByEmail(email);
  }

  public async getUsersByIds(ids: string[]): Promise<User[]> {
    return this.usersRepository.findManyByIds(ids);
  }
}
