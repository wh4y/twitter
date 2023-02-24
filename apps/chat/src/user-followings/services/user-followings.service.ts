import { Injectable } from '@nestjs/common';

import { UserFollowingRepository } from '../repositories/user-following.repository';

@Injectable()
export class UserFollowingsService {
  constructor(private readonly userFollowingRepository: UserFollowingRepository) {}

  public async areBothUsersFollowersOfEachOther(firstUserId: string, secondUserId: string): Promise<boolean> {
    const isSecondUserFollowerOfFirstUser = await this.userFollowingRepository.checkIfExistsByFollowerAndFollowedUserIds(
      secondUserId,
      firstUserId,
    );
    const isFirstUserFollowerOfSecondUser = await this.userFollowingRepository.checkIfExistsByFollowerAndFollowedUserIds(
      firstUserId,
      secondUserId,
    );

    return isSecondUserFollowerOfFirstUser && isFirstUserFollowerOfSecondUser;
  }
}
