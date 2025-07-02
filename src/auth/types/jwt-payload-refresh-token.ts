import { Payload } from './payload';

export class JwtPayloadRefreshToken extends Payload {
	refresh_token: string;
}
