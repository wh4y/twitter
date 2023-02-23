import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserNotExistException } from '../../users/exceptions/user-not-exist.exception';
import { UsersRepository } from '../../users/repositories/users.repository';
import { UserFollowing } from '../entities/user-following.entity';
import { FollowingAlreadyExistsException } from '../exceptions/following-already-exists.exception';
import { FollowingNotExistException } from '../exceptions/following-not-exist.exception';

@Injectable()
export class UserFollowingsRepository {
  constructor(
    @InjectRepository(UserFollowing) private readonly typeormRepository: Repository<UserFollowing>,
    private readonly usersRepository: UsersRepository,
  ) {}

  public async saveIfNotExistOrThrow(following: UserFollowing): Promise<void> {
    const doesFollowerExist = await this.usersRepository.checkIfUserExistsById(following.followerId);
    const doesFollowedUserExist = await this.usersRepository.checkIfUserExistsById(following.followedUserId);

    if (!doesFollowedUserExist || !doesFollowerExist) {
      throw new UserNotExistException();
    }

    const doesFollowingExist = await this.checkIfExistsByFollowerAndFollowedUserIds(following.followerId, following.followedUserId);

    if (doesFollowingExist) {
      throw new FollowingAlreadyExistsException();
    }

    await this.typeormRepository.save(following);
  }

  public async findManyByFollowedUserIdOrThrow(followedUserId: string): Promise<UserFollowing[]> {
    const doesUserExist = await this.usersRepository.checkIfUserExistsById(followedUserId);

    if (!doesUserExist) {
      throw new UserNotExistException();
    }

    return this.typeormRepository.find({
      where: { followedUserId },
    });
  }

  public async findManyByFollowerIdOrThrow(followerId: string): Promise<UserFollowing[]> {
    const doesUserExist = await this.usersRepository.checkIfUserExistsById(followerId);

    if (!doesUserExist) {
      throw new UserNotExistException();
    }

    return this.typeormRepository.find({
      where: { followerId },
    });
  }

  public async deleteByFollowerAndFollowedUserIdsOrThrow(followerId: string, followedUserId: string): Promise<UserFollowing> {
    const following = await this.findOneByFollowerAndFollowedUserIdsOrThrow(followerId, followedUserId);

    await this.typeormRepository.delete({ followerId, followedUserId });

    return following;
  }

  public async findOneByFollowerAndFollowedUserIdsOrThrow(followerId: string, followedUserId: string): Promise<UserFollowing> {
    const following = await this.typeormRepository.findOne({
      where: { followerId, followedUserId },
    });

    if (!following) {
      throw new FollowingNotExistException();
    }

    return following;
  }

  public async checkIfExistsByFollowerAndFollowedUserIds(followerId: string, followedUserId: string): Promise<boolean> {
    return this.typeormRepository.exist({ where: { followerId, followedUserId } });
  }
}
