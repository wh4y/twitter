import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';

import { AuthGuard } from 'common/auth';
import { CurrentUser } from 'common/auth/decorator/current-user.decorator';
import { Paginated } from 'common/pagination';

import { User } from '../../user/entities/user.entity';
import { CreateGroupChatDto } from '../dtos/create-group-chat.dto';
import { CreatePrivateChatDto } from '../dtos/create-private-chat.dto';
import { PostMessageDto } from '../dtos/post-message.dto';
import { Chat } from '../entities/chat.entity';
import { Message } from '../entities/message.entity';
import { ChatService } from '../services/chat/chat.service';

@Controller('/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('/start-private')
  @UseGuards(AuthGuard)
  public async createPrivateChat(@Body() { interlocutorId }: CreatePrivateChatDto, @CurrentUser() currentUser: User): Promise<Chat> {
    return this.chatService.createPrivateChat({ interlocutor: { id: interlocutorId } as User, currentUser });
  }

  @Post('/start-group')
  @UseGuards(AuthGuard)
  public async createGroupChat(@Body() { invitedUserIds }: CreateGroupChatDto, @CurrentUser() currentUser: User): Promise<Chat> {
    const invitedUsers = invitedUserIds.map((id) => new User({ id }));

    return this.chatService.createGroupChat({ currentUser, invitedUsers });
  }

  @UseGuards(AuthGuard)
  @Post('/:chatId/post-message')
  public async postMessageInChat(
    @Param('chatId') chatId: string,
    @Body() { text }: PostMessageDto,
    @CurrentUser() currentUser: User,
  ): Promise<Message> {
    return this.chatService.postMessage(chatId, { text }, currentUser);
  }

  @UseGuards(AuthGuard)
  @Get()
  public async getCurrentUserChats(
    @CurrentUser() currentUser: User,
    @Query('take', new ParseIntPipe()) take: number,
    @Query('page', new ParseIntPipe()) page: number,
  ): Promise<Paginated<Chat>> {
    return this.chatService.getUserChats(currentUser.id, { take, page });
  }
}
