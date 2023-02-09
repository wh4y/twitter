import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { User } from '../entities/user.entity';
import { USER_CREATED_EVENT, UserCreatedEventPayload } from '../events/user-created.event';
import { UserAlreadyExistsException } from '../exceptions/user-already-exists.exception';
import { UsersRepository } from '../repositories/users.repository';

import { AddNewUserOptions } from './users-service.options';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository, private readonly eventEmitter: EventEmitter2) {}

  public async addNewUser(options: AddNewUserOptions): Promise<User> {
    const doesUserAlreadyExist = await this.usersRepository.checkIfUserExistsByEmail(options.email);

    if (doesUserAlreadyExist) {
      throw new UserAlreadyExistsException();
    }

    const user = new User({ ...options });

    await this.usersRepository.save(user);

    this.eventEmitter.emit(USER_CREATED_EVENT, new UserCreatedEventPayload(user));

    return user;
  }

  public async getAllUsers(): Promise<User[]> {
    return this.usersRepository.findAll();
  }

  public async getUserById(id: string): Promise<User> {
    return this.usersRepository.findUserByIdOrThrow(id);
  }

  public async doesUserExistByEmail(email: string): Promise<boolean> {
    return this.usersRepository.checkIfUserExistsByEmail(email);
  }

  public async findUserByEmail(email: string): Promise<User> {
    return this.usersRepository.findUserByEmailOrThrow(email);
  }

  public async getUsersByIds(ids: string[]): Promise<User[]> {
    return this.usersRepository.findManyByIds(ids);
  }
}
