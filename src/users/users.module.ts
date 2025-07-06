import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { UsersController } from './users.controller';

@Module({
	imports: [TypeOrmModule.forFeature([User])],
	exports: [UsersService],
	providers: [UsersService],
	controllers: [UsersController],
})
export class UsersModule {}
