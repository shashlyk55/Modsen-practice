import {
	Injectable,
	CanActivate,
	ExecutionContext,
	UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service'; // Укажите правильный путь
import { Request } from 'express';
import { LoginUserDTO } from 'src/users/dto/login-user.dto';
import { ValidatedUser } from 'src/users/types/validated-user';

@Injectable()
export class LocalAuthGuard implements CanActivate {
	constructor(private authService: AuthService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest<Request>();

		const loginUserDto = request.body as LoginUserDTO;

		const user: ValidatedUser | null = await this.authService.validateUser(
			loginUserDto.username,
			loginUserDto.password,
		);
		if (!user) {
			throw new UnauthorizedException();
		}

		request.user = user;
		return true;
	}
}
