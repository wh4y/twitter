import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { User } from '../entities/user.entity';
import { UserNotExistException } from '../exceptions/user-not-exist.exception';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly typeormRepository: Repository<User>,
  ) {}

  public async save(user: User): Promise<User> {
    return this.typeormRepository.save(user);
  }

  public async findUserByIdOrThrow(id: string): Promise<User> {
    const user = await this.typeormRepository.findOneBy({ id });

    if (!user) {
      throw new UserNotExistException();
    }

    return user;
  }

  public async findAll(): Promise<User[]> {
    return this.typeormRepository.find();
  }

  public async findUserByEmailOrThrow(email: string): Promise<User> {
    const user = await this.typeormRepository.findOneBy({ email });

    if (!user) {
      throw new UserNotExistException();
    }

    return user;
  }

  public async checkIfUserExistsByEmail(email: string): Promise<boolean> {
    return this.typeormRepository.createQueryBuilder().where({ email }).getExists();
  }

  public async checkIfUserExistsById(id: string): Promise<boolean> {
    return this.typeormRepository.createQueryBuilder().where({ id }).getExists();
  }

  public async findManyByIds(ids: string[]): Promise<User[]> {
    return this.typeormRepository.find({
      where: {
        id: In(ids),
      },
    });
  }
}
