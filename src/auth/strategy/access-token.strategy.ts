import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Payload } from '../types/payload';
import { SessionsService } from '../../sessions/sessions.service';
import { Request } from 'express';
import {
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ValidatedUser } from 'src/users/types/validated-user';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(
	Strategy,
	'jwt-access',
) {
	constructor(
		private sessionService: SessionsService,
		private config: ConfigService,
		private userService: UsersService,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: config.getOrThrow('ACCESS_TOKEN_SECRET'),
			//ignoreExpiration: false,
			passReqToCallback: true,
		});
	}
	async validate(req: Request, payload: Payload): Promise<ValidatedUser> {
		const authHeader = req.headers.authorization;
		const token = authHeader?.split(' ')[1].trim();

		if (!token) {
			throw new UnauthorizedException('token not found');
		}
		const session =
			await this.sessionService.findSessionByAccessToken(token);

		if (!session) {
			throw new UnauthorizedException('Session not found');
		}

		const user = await this.userService.findById(payload.id);

		if (!user) {
			throw new NotFoundException('user not found');
		}
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { password, ...result } = user;

		return result;
	}
}
