import { Payload } from './payload';

export class JwtPayloadRefreshToken extends Payload {
	constructor(userId: number, username: string, refreshToken: string) {
		super(userId, username);
		this.refreshToken = refreshToken;
	}
	refreshToken: string;
}
