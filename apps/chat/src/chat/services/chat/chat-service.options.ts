import { User } from '../../../user/entities/user.entity';

export type CreateGroupChatOptions = {
  founder: User;
  invitedUsers: User[];
};

export type CreatePrivateChatOptions = {
  currentUser: User;
  interlocutor: User;
};

export type MessageContent = {
  text: string;
};
