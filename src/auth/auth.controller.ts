import {
	Body,
	Controller,
	HttpCode,
	HttpStatus,
	Post,
	Req,
	UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDTO } from '../users/dto/register-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { ValidatedUser } from 'src/users/types/validated-user';
import { CheckSessionGuard } from './guards/check-session.guard';

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) {}

	@Post('register')
	@HttpCode(HttpStatus.OK)
	async register(
		@Body() registerUserDto: RegisterUserDTO,
		@Req() req: Request,
	) {
		const user = await this.authService.register(registerUserDto);
		return this.authService.login(user, req);
	}

	@Post('login')
	@HttpCode(HttpStatus.OK)
	@UseGuards(LocalAuthGuard)
	async login(@Req() req: Request) {
		return this.authService.login(req.user as ValidatedUser, req);
	}

	@Post('refresh')
	@HttpCode(HttpStatus.OK)
	@UseGuards(AuthGuard('jwt-refresh'), CheckSessionGuard)
	refresh(@Req() req: Request) {
		return this.authService.refreshTokens(req);
	}

	@Post('logout')
	@HttpCode(HttpStatus.OK)
	@UseGuards(AuthGuard('jwt-access'))
	async logout(@Req() req: Request) {
		return this.authService.logout(req);
	}
}
