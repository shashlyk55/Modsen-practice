import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Payload } from '../types/payload';
import { jwtConstants } from '../jwt-constants';
import { SessionService } from '../session.service';
import { Request } from 'express';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AccessTokenStartegy extends PassportStrategy(
	Strategy,
	'jwt-access',
) {
	constructor(private sessionService: SessionService) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: jwtConstants.access_secret,
			//ignoreExpiration: false,
			passReqToCallback: true,
		});
	}
	async validate(req: Request, payload: Payload) {
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

		return { username: payload.username, userId: payload.userId };
	}

	private getTokenFromRequest(req: Request) {
		const authHeader = req.headers.authorization;
		return authHeader?.split(' ')[1].trim();
	}
}
