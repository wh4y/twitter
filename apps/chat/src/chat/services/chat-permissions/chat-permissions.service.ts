import { AbilityBuilder, AbilityTuple, MatchConditions, PureAbility } from '@casl/ability';
import { Injectable } from '@nestjs/common';

import { UserFollowingsService } from '../../../external/user-followings/services/user-followings.service';
import { User } from '../../../user/entities/user.entity';
import { Chat } from '../../entities/chat.entity';
import { ChatAbility } from '../../enums/chat-ability.enum';
import { ChatMemberRole } from '../../enums/chat-member-role.enum';
import { AccessDeniedException } from '../../exceptions/access-denied.exception';
import { CurrentUserNotAdminException } from '../../exceptions/current-user-not-admin.exception';
import { CurrentUserNotInChatException } from '../../exceptions/current-user-not-in-chat.exception';
import { UsersNotFollowersOfEachOtherException } from '../../exceptions/users-not-followers-of-each-other.exception';
import { ChatRepository } from '../../repositories/chat.repository';

type UserAbility = PureAbility<AbilityTuple, MatchConditions>;
const lambdaMatcher = (matchConditions: MatchConditions) => matchConditions;

@Injectable()
export class ChatPermissionsService {
  constructor(private readonly followingsService: UserFollowingsService, private readonly chatRepository: ChatRepository) {}

  public async defineAbilitiesFor(currentUser: User): Promise<UserAbility> {
    const { build, can } = new AbilityBuilder<UserAbility>(PureAbility);

    can<Chat>(ChatAbility.POST_MESSAGES_IN, 'Chat', ({ members }) => {
      return members.some((member) => member.userId === currentUser.id);
    });

    can<Chat>(ChatAbility.VIEW, 'Chat', ({ members }) => {
      return members.some((member) => member.userId === currentUser.id);
    });

    return build({
      conditionsMatcher: lambdaMatcher,
    });
  }

  public async currentUserCanAddMembersToChatOrThrow(currentUser: User, chatId: string): Promise<void> {
    const isCurrentUserInChat = await this.chatRepository.checkIfMemberExistsByMemberAndChatIds(currentUser.id, chatId);

    AccessDeniedException.from(new CurrentUserNotInChatException()).throwUnless(isCurrentUserInChat);
  }

  public async currentUserCanRemoveMembersFormGroupChatOrThrow(currentUser: User, chatId: string): Promise<void> {
    const member = await this.chatRepository.findMemberByMemberAndChatIdsThrow(currentUser.id, chatId);

    const isMemberAdmin = member.role === ChatMemberRole.ADMIN;

    AccessDeniedException.from(new CurrentUserNotAdminException()).throwUnless(isMemberAdmin);
  }

  public async currentUserCanCreatePrivateChatWithInterlocutorOrThrow(currentUser: User, interlocutor: User): Promise<void> {
    const areBothUsersFollowersOfEachOther = await this.followingsService.areBothUsersFollowersOfEachOther(
      currentUser.id,
      interlocutor.id,
    );

    AccessDeniedException.from(new UsersNotFollowersOfEachOtherException()).throwUnless(areBothUsersFollowersOfEachOther);
  }
}
