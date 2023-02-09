import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsOrder, Repository } from 'typeorm';

import { Paginated, PaginationOptions } from 'common/pagination';
import { SortOptions } from 'common/sort';

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

    const orderOptions: FindOptionsOrder<UserProfile> = {};

    if (sortOptions.type === UserProfilesSortType.FOLLOWERS_COUNT) {
      orderOptions.followersCount = sortOptions.direction;
    }

    const [profiles, total] = await this.typeormRepository.findAndCount({
      relations: {
        avatar: true,
        user: true,
      },
      skip,
      take,
      order: orderOptions,
    });

    return { data: profiles, page: paginationOptions.page, total, take: take || total };
  }

  public async findProfileByUserIdOrThrow(userId: string): Promise<UserProfile> {
    const doesUserExist = await this.usersRepository.checkIfUserExistsById(userId);

    if (!doesUserExist) {
      throw new UserNotExistException();
    }

    // return this.typeormRepository
    //   .createQueryBuilder('profile')
    //   .select('profile.userId', 'userId')
    //   .select((qb) => {
    //     return qb.select('user.name').from(User, 'user').where('user.id = :userId', { userId });
    //   }, 'username')
    //   .addSelect((qb) => {
    //     return qb
    //       .select('CAST(COUNT(*) AS INT)')
    //       .from(UserFollowing, 'following')
    //       .where('following."followedUserId" = :userId', { userId });
    //   }, 'followersCount')
    //   .addSelect((qb) => {
    //     return qb
    //       .select('CAST(COUNT(*) AS INT)')
    //       .from(UserFollowing, 'following')
    //       .where('following."followerId" = :userId', { userId });
    //   }, 'followingsCount')
    //   .leftJoinAndMapOne('profile.avatar', UserProfileAvatar, 'avatar', 'profile.id = avatar.profileId')
    //   .where('profile.userId = :userId', { userId })
    //   .getRawOne();

    const profile = await this.typeormRepository.findOne({
      where: { userId },
      relations: {
        avatar: true,
        user: true,
      },
    });

    return profile;
  }
}
