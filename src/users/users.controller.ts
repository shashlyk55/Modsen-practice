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

	@Get('/me')
	@HttpCode(HttpStatus.OK)
	async getMe(@Req() req: Request) {
		const userId = (req.user as ValidatedUser).id;
		return this.usersService.getUser(userId);
	}

	@Get('/:id')
	@HttpCode(HttpStatus.OK)
	async getUser(@Req() req: Request) {
		const userId = +req.params.id;
		return this.usersService.getUser(userId);
	}
}
