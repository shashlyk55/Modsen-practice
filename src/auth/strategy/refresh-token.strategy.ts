import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Payload } from '../types/payload';
import { Request } from 'express';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
	Strategy,
	'jwt-refresh',
) {
	constructor(private config: ConfigService) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: config.getOrThrow('REFRESH_TOKEN_SECRET'),
			passReqToCallback: true,
		});
	}
	validate(req: Request, payload: Payload) {
		const authHeader = req.headers.authorization;
		const refresh_token = authHeader?.split(' ')[1];

		return { ...payload, refresh_token };
	}
}
