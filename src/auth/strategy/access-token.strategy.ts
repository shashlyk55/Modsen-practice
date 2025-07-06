import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Payload } from '../types/payload';
import { SessionService } from '../session.service';
import { Request } from 'express';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ValidatedUser } from 'src/users/types/validated-user';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(
	Strategy,
	'jwt-access',
) {
	constructor(
		private sessionService: SessionService,
		private config: ConfigService,
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

		return { username: payload.username, id: payload.id };
	}
}
