import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersController } from './controllers/users.controller';
import { User } from './entities/user.entity';
import { UsersMapperProfile } from './mapper/users.mapper-profile';
import { UsersRepository } from './repositories/users.repository';
import { UsersService } from './services/users.service';

@Module({
  controllers: [UsersController],
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService, UsersRepository, UsersMapperProfile],
  exports: [UsersService, UsersMapperProfile],
})
export class UsersModule {}
