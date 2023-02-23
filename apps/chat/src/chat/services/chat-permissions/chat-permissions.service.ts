import { AbilityBuilder, AbilityTuple, MatchConditions, PureAbility } from '@casl/ability';
import { Injectable } from '@nestjs/common';

import { UserFollowingsService } from '../../../external/user-followings/services/user-followings.service';
import { User } from '../../../user/entities/user.entity';
import { Chat } from '../../entities/chat.entity';
import { ChatAbility } from '../../enums/chat-ability.enum';
import { AccessDeniedException } from '../../exceptions/access-denied.exception';
import { UsersNotFollowersOfEachOtherException } from '../../exceptions/users-not-followers-of-each-other.exception';

type UserAbility = PureAbility<AbilityTuple, MatchConditions>;
const lambdaMatcher = (matchConditions: MatchConditions) => matchConditions;

@Injectable()
export class ChatPermissionsService {
  constructor(private readonly followingsService: UserFollowingsService) {}

  public async defineAbilityToPostMessagesFor(currentUser: User): Promise<UserAbility> {
    const { build, can } = new AbilityBuilder<UserAbility>(PureAbility);

    can<Chat>(ChatAbility.POST_MESSAGES_IN, 'Chat', ({ members }) => {
      return members.some((member) => member.userId === currentUser.id);
    });

    return build({
      conditionsMatcher: lambdaMatcher,
    });
  }

  public async currentUserCanChatWithInterlocutorOrThrow(currentUser: User, interlocutor: User): Promise<void> {
    const areBothUsersFollowersOfEachOther = await this.followingsService.areBothUsersFollowersOfEachOther(
      currentUser.id,
      interlocutor.id,
    );

    AccessDeniedException.from(new UsersNotFollowersOfEachOtherException()).throwUnless(areBothUsersFollowersOfEachOther);
  }
}
