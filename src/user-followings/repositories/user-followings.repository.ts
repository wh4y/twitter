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

    const savedFollowing = await this.findOneByFollowerAndFollowedUserIdsOrThrow(following.followerId, following.followedUserId);

    Object.assign(following, savedFollowing);
  }

  public async findManyByFollowedUserIdOrThrow(followedUserId: string): Promise<UserFollowing[]> {
    const doesUserExist = await this.usersRepository.checkIfUserExistsById(followedUserId);

    if (!doesUserExist) {
      throw new UserNotExistException();
    }

    return this.typeormRepository.find({
      where: { followedUserId },
      relations: {
        follower: true,
      },
    });
  }

  public async findManyByFollowerIdOrThrow(followerId: string): Promise<UserFollowing[]> {
    const doesUserExist = await this.usersRepository.checkIfUserExistsById(followerId);

    if (!doesUserExist) {
      throw new UserNotExistException();
    }

    return this.typeormRepository.find({
      where: { followerId },
      relations: {
        followedUser: true,
      },
    });
  }

  public async deleteByFollowerAndFollowedUserIdsOrThrow(followerId: string, followedUserId: string): Promise<void> {
    const doesFollowingExist = await this.checkIfExistsByFollowerAndFollowedUserIds(followerId, followedUserId);

    if (!doesFollowingExist) {
      throw new FollowingNotExistException();
    }

    await this.typeormRepository.delete({ followerId, followedUserId });
  }

  public async findOneByFollowerAndFollowedUserIdsOrThrow(followerId: string, followedUserId: string): Promise<UserFollowing> {
    const following = await this.typeormRepository.findOne({
      where: { followerId, followedUserId },
      relations: { follower: true, followedUser: true },
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
