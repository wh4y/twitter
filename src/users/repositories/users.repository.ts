import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../entities/user';
import { UserDoesntExistException } from '../exceptions/user-doesnt-exist.exception';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly typeormRepository: Repository<User>,
  ) {}

  public async save(user: User): Promise<User> {
    return this.typeormRepository.save(user);
  }

  public async findUserById(id: string): Promise<User> {
    const user = await this.typeormRepository.findOneBy({ id });

    if (!user) {
      throw new UserDoesntExistException();
    }

    return user;
  }

  public async findAll(): Promise<User[]> {
    return this.typeormRepository.find();
  }

  public async findUserByEmail(email: string): Promise<User> {
    const user = await this.typeormRepository.findOneBy({ email });

    if (!user) {
      throw new UserDoesntExistException();
    }

    return user;
  }

  public async checkIfUserAlreadyExistsByEmail(email: string): Promise<boolean> {
    return this.typeormRepository.createQueryBuilder().where({ email }).getExists();
  }

  public async checkIfUserAlreadyExistsById(id: string): Promise<boolean> {
    return this.typeormRepository.createQueryBuilder().where({ id }).getExists();
  }
}
