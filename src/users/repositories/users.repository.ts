import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserEntity } from '../entities/user.entity';
import { UserDoesntExistException } from '../exceptions/user-doesnt-exist.exception';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly typeormRepository: Repository<UserEntity>,
  ) {}

  public async save(user: UserEntity): Promise<UserEntity> {
    return this.typeormRepository.save(user);
  }

  public async findUserById(id: string): Promise<UserEntity> {
    const user = await this.typeormRepository.findOneBy({ id });

    if (!user) {
      throw new UserDoesntExistException();
    }

    return user;
  }

  public async findAll(): Promise<UserEntity[]> {
    return this.typeormRepository.find();
  }

  public async findUserByEmail(email: string): Promise<UserEntity> {
    const user = await this.typeormRepository.findOneBy({ email });

    if (!user) {
      throw new UserDoesntExistException();
    }

    return user;
  }

  public async checkIfUserExistsByEmail(email: string): Promise<boolean> {
    return this.typeormRepository.createQueryBuilder().where({ email }).getExists();
  }

  public async checkIfUserExistsById(id: string): Promise<boolean> {
    return this.typeormRepository.createQueryBuilder().where({ id }).getExists();
  }
}
