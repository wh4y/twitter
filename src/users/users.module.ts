import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserPrivacyModule } from '../user-privacy/user-privacy.module';

import { UsersController } from './controllers/users.controller';
import { User } from './entities/user.entity';
import { UsersRepository } from './repositories/users.repository';
import { UsersService } from './services/users.service';

@Module({
  controllers: [UsersController],
  imports: [TypeOrmModule.forFeature([User]), forwardRef(() => UserPrivacyModule)],
  providers: [UsersService, UsersRepository],
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}
