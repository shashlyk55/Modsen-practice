import { UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { ValidatedUser } from 'src/users/types/validated-user';

export class LocalStrategy extends PassportStrategy(Strategy) {
	constructor(private authService: AuthService) {
		super();
	}

	async validate(username: string, password: string): Promise<ValidatedUser> {
		console.log(username, password);
		const user: ValidatedUser | null = await this.authService.validateUser(
			username,
			password,
		);
		console.log('validate');
		if (!user) {
			throw new UnauthorizedException();
		}
		return user;
	}
}
