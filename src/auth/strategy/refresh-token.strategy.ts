import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Payload } from '../types/payload';
import { jwtConstants } from '../jwt-constants';
import { Request } from 'express';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
	Strategy,
	'jwt-refresh',
) {
	constructor() {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: jwtConstants.refresh_secret,
			passReqToCallback: true,
		});
	}
	validate(req: Request, payload: Payload) {
		const authHeader = req.headers.authorization;
		const refresh_token = authHeader?.split(' ')[1];

		return { ...payload, refresh_token };
	}
}
