import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query, UseFilters, UseGuards } from '@nestjs/common';

import { AuthGuard } from 'common/auth';
import { CurrentUser } from 'common/auth/decorator/current-user.decorator';
import { Paginated } from 'common/pagination';

import { User } from '../../user/entities/user.entity';
import { ChatMemberDto } from '../dtos/chat-member.dto';
import { CreateGroupChatDto } from '../dtos/create-group-chat.dto';
import { CreatePrivateChatDto } from '../dtos/create-private-chat.dto';
import { PostMessageDto } from '../dtos/post-message.dto';
import { Chat } from '../entities/chat.entity';
import { Message } from '../entities/message.entity';
import { ChatNotExistExceptionFilter } from '../exception-filters/chat-not-exist.exception-filter';
import { ChatPermissionsExceptionFilter } from '../exception-filters/chat-permissions.exception-filter';
import { CreateChatExceptionFilter } from '../exception-filters/create-chat.exception-filter';
import { ChatService } from '../services/chat/chat.service';

@UseFilters(ChatPermissionsExceptionFilter, ChatNotExistExceptionFilter)
@Controller('/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('/start-group')
  @UseGuards(AuthGuard)
  public async createGroupChat(@Body() { invitedUserIds }: CreateGroupChatDto, @CurrentUser() currentUser: User): Promise<Chat> {
    const invitedUsers = invitedUserIds.map((id) => new User({ id }));

    return this.chatService.createGroupChat({ founder: currentUser, invitedUsers });
  }

  @UseFilters(CreateChatExceptionFilter)
  @Post('/start-private')
  @UseGuards(AuthGuard)
  public async createPrivateChat(@Body() { interlocutorId }: CreatePrivateChatDto, @CurrentUser() currentUser: User): Promise<Chat> {
    return this.chatService.createPrivateChat({ interlocutor: { id: interlocutorId } as User, currentUser });
  }

  @Post('/:chatId/member')
  @UseGuards(AuthGuard)
  public async addMemberToGroupChat(
    @Param('chatId') chatId: string,
    @Body() { userId }: ChatMemberDto,
    @CurrentUser() currentUser: User,
  ): Promise<void> {
    await this.chatService.addMemberToGroupChat(chatId, userId, currentUser);
  }

  @Delete('/:chatId/member')
  @UseGuards(AuthGuard)
  public async removeMemberFromGroupChat(
    @Param('chatId') chatId: string,
    @Body() { userId }: ChatMemberDto,
    @CurrentUser() currentUser: User,
  ): Promise<void> {
    await this.chatService.removeMemberFromGroupChat(chatId, userId, currentUser);
  }

  @UseGuards(AuthGuard)
  @Delete('/:chatId/leave')
  public async leaveGroupChat(@Param('chatId') chatId: string, @CurrentUser() currentUser: User): Promise<void> {
    await this.chatService.leaveGroupChat(chatId, currentUser);
  }

  @UseFilters(CreateChatExceptionFilter)
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

  @UseGuards(AuthGuard)
  @Get('/:chatId/messages')
  public async getChatMessages(
    @CurrentUser() currentUser: User,
    @Param('chatId') chatId: string,
    @Query('take', new ParseIntPipe()) take: number,
    @Query('page', new ParseIntPipe()) page: number,
  ): Promise<Paginated<Message>> {
    return this.chatService.getChatMessages(chatId, { take, page }, currentUser);
  }
}
