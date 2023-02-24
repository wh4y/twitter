import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserFollowing } from '../entities/user-following.entity';

@Injectable()
export class UserFollowingRepository {
  constructor(@InjectRepository(UserFollowing) private readonly typeormRepository: Repository<UserFollowing>) {}

  public async checkIfExistsByFollowerAndFollowedUserIds(followerId: string, followedUserId: string): Promise<boolean> {
    return this.typeormRepository.exist({ where: { followerId, followedUserId } });
  }
}
