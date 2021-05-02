import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../../../entities/users.entity';
import { UsersService } from '../../../services/users.service';
import { AdminUsersController } from './users.controller';

@Module({
  controllers: [AdminUsersController],
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService]
})
export class AdminUsersModule {}
