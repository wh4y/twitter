import { User } from '../../users/entities/user.entity';

export type DefineAbilityForCurrentUserOptions = {
  currentUser: User;
  author: User;
};
