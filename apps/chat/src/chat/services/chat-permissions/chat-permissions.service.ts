import { Injectable } from '@nestjs/common';

import { UserFollowingsService } from '../../../external/user-followings/services/user-followings.service';
import { User } from '../../../user/entities/user.entity';
import { ChatMemberRole } from '../../enums/chat-member-role.enum';
import { AccessDeniedException } from '../../exceptions/access-denied.exception';
import { CurrentUserNotAdminException } from '../../exceptions/current-user-not-admin.exception';
import { CurrentUserNotInChatException } from '../../exceptions/current-user-not-in-chat.exception';
import { UsersNotFollowersOfEachOtherException } from '../../exceptions/users-not-followers-of-each-other.exception';
import { ChatRepository } from '../../repositories/chat.repository';

@Injectable()
export class ChatPermissionsService {
  constructor(private readonly followingsService: UserFollowingsService, private readonly chatRepository: ChatRepository) {}

  public async currentUserCanPostMessagesInChatOrThrow(currentUser: User, chatId: string): Promise<void> {
    const isCurrentUserInChat = await this.chatRepository.checkIfMemberExistsByMemberAndChatIds(currentUser.id, chatId);

    AccessDeniedException.from(new CurrentUserNotInChatException()).throwUnless(isCurrentUserInChat);
  }

  public async currentUserCanViewChatOrThrow(currentUser: User, chatId: string): Promise<void> {
    const isCurrentUserInChat = await this.chatRepository.checkIfMemberExistsByMemberAndChatIds(currentUser.id, chatId);

    AccessDeniedException.from(new CurrentUserNotInChatException()).throwUnless(isCurrentUserInChat);
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
