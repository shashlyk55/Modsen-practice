import { HttpStatus } from '@nestjs/common';
import {
	Controller,
	Get,
	HttpCode,
	Req,
	UseGuards,
} from '@nestjs/common/decorators';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { Request } from 'express';
import { ValidatedUser } from './types/validated-user';

@UseGuards(AuthGuard('jwt-access'))
@Controller('users')
export class UsersController {
	constructor(private usersService: UsersService) {}

	@Get('me')
	@HttpCode(HttpStatus.OK)
	async getMe(@Req() req: Request) {
		return this.usersService.getUser((req.user as ValidatedUser).id);
	}

	@Get(':id')
	@HttpCode(HttpStatus.OK)
	async getUser(@Req() req: Request) {
		return this.usersService.getUser(+req.params.id);
	}
}
