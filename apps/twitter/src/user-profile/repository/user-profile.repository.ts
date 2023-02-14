import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Paginated, PaginationOptions } from 'common/pagination';
import { SortOptions } from 'common/sort';

import { UserFollowing } from '../../user-followings/entities/user-following.entity';
import { UserNotExistException } from '../../users/exceptions/user-not-exist.exception';
import { UsersRepository } from '../../users/repositories/users.repository';
import { UserProfile } from '../entities/user-profile.entity';
import { UserProfilesSortType } from '../enums/user-profiles-sort-type.enum';

@Injectable()
export class UserProfileRepository {
  constructor(
    @InjectRepository(UserProfile) private readonly typeormRepository: Repository<UserProfile>,
    private readonly usersRepository: UsersRepository,
  ) {}

  public async save(profile: UserProfile): Promise<void> {
    await this.typeormRepository.save(profile);

    const savedProfile = await this.findProfileByUserIdOrThrow(profile.userId);

    Object.assign(profile, savedProfile);
  }

  public async findManyProfiles(
    paginationOptions: PaginationOptions,
    sortOptions: SortOptions<UserProfilesSortType>,
  ): Promise<Paginated<UserProfile>> {
    const take = paginationOptions.take || 0;
    const skip = (paginationOptions.page - 1) * take;

    let sortBy: string = null;

    if (sortOptions.type === UserProfilesSortType.FOLLOWERS_COUNT) {
      sortBy = 'followers_count';
    }

    const [profiles, total] = await this.typeormRepository
      .createQueryBuilder('profile')
      .leftJoinAndSelect('profile.avatar', 'avatar')
      .leftJoinAndSelect('profile.user', 'user')
      .loadRelationCountAndMap('profile.followingsCount', 'profile.followings')
      .loadRelationCountAndMap('profile.followersCount', 'profile.followers')
      .addSelect((qb) => {
        return qb
          .select('COUNT(follower.followedUserId)', 'followersCount')
          .from(UserFollowing, 'follower')
          .where('follower.followedUserId = profile.userId');
      }, 'followers_count')
      .orderBy(sortBy, sortOptions.direction)
      .skip(skip)
      .take(take)
      .getManyAndCount();

    return { data: profiles, page: paginationOptions.page, total, take: take || total };
  }

  public async findProfileByUserIdOrThrow(userId: string): Promise<UserProfile> {
    const doesUserExist = await this.usersRepository.checkIfUserExistsById(userId);

    if (!doesUserExist) {
      throw new UserNotExistException();
    }

    return this.typeormRepository
      .createQueryBuilder('profile')
      .where({ userId })
      .leftJoinAndSelect('profile.avatar', 'avatar')
      .leftJoinAndSelect('profile.user', 'user')
      .loadRelationCountAndMap('profile.followingsCount', 'profile.followings')
      .loadRelationCountAndMap('profile.followersCount', 'profile.followers')
      .getOne();
  }
}
