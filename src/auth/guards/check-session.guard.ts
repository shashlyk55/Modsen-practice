import {
	Injectable,
	CanActivate,
	ExecutionContext,
	UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { SessionsService } from 'src/sessions/sessions.service';
import { JwtPayloadRefreshToken } from '../types/jwt-payload-refresh-token';

@Injectable()
export class CheckSessionGuard implements CanActivate {
	constructor(private sessionService: SessionsService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest<Request>();

		const refreshToken: string = (request.user as JwtPayloadRefreshToken)
			.refresh_token;
		const session =
			await this.sessionService.findSessionByRefreshToken(refreshToken);

		if (!session) {
			throw new UnauthorizedException('Invalid refresh token');
		}
		if (session.expiresAt < new Date()) {
			await this.sessionService.deleteSession(session.accessTokenHash);
			throw new UnauthorizedException('Session expired');
		}
		await this.sessionService.deleteSession(session.accessTokenHash);

		return true;
	}
}
