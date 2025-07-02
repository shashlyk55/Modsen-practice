import {
	Body,
	Controller,
	HttpCode,
	HttpStatus,
	Post,
	Req,
	UnauthorizedException,
	UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDTO } from '../users/dto/register-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { LoginUserDTO } from 'src/users/dto/login-user.dto';
import { Request } from 'express';
import { JwtPayloadRefreshToken } from './types/jwt-payload-refresh-token';
import { User } from 'src/entities/user.entity';

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
	async login(@Body() loginUserDto: LoginUserDTO, @Req() req: Request) {
		const user = await this.authService.validateUser(
			loginUserDto.username,
			loginUserDto.password,
		);
		if (!user) {
			throw new UnauthorizedException();
		}
		return this.authService.login(user as User, req);
	}

	@Post('refresh')
	@HttpCode(HttpStatus.OK)
	@UseGuards(AuthGuard('jwt-refresh'))
	refresh(@Req() req: Request & { user: JwtPayloadRefreshToken }) {
		return this.authService.refreshTokens(req.user.refresh_token, req);
	}

	@Post('logout')
	@HttpCode(HttpStatus.OK)
	@UseGuards(AuthGuard('jwt-access'))
	async logout(@Req() req: Request) {
		const authHeader = req.headers.authorization;
		const token = authHeader?.split(' ')[1].trim();
		if (!token) {
			throw new UnauthorizedException('token not found');
		}
		return this.authService.logout(token);
	}
}
