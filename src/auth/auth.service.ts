import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { RegisterUserDTO } from '../users/dto/register-user.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ValidatedUser } from 'src/users/types/validated-user';
import { jwtConstants } from './jwt-constants';
import { SessionService } from './session.service';
import { Request } from 'express';
import { User } from 'src/entities/user.entity';

@Injectable()
export class AuthService {
	constructor(
		private usersService: UsersService,
		private jwtService: JwtService,
		private sessionService: SessionService,
	) {}

	async register(registerUserDto: RegisterUserDTO) {
		const user = await this.usersService.create(registerUserDto);
		//const { password, ...result } = user;
		return user;
	}

	async login(user: User, req: Request) {
		const payload = { username: user.username, id: user.id };

		const userAgent = req.headers['user-agent']
			? req.headers['user-agent']
			: '';
		const ipAddress = req.headers.host ? req.headers.host : '';
		const expiresAt = new Date(
			Date.now() +
				Number.parseInt(
					jwtConstants.refresh_expires_in.slice(
						0,
						jwtConstants.refresh_expires_in.length - 1,
					),
				) *
					24 *
					60 *
					60 *
					1000,
		);

		const accessToken = this.jwtService.sign(payload, {
			secret: jwtConstants.access_secret,
			expiresIn: jwtConstants.access_expires_in,
		});

		const refreshToken = this.jwtService.sign(payload, {
			secret: jwtConstants.refresh_secret,
			expiresIn: jwtConstants.refresh_expires_in,
		});

		await this.sessionService.createSession(
			user,
			accessToken,
			refreshToken,
			userAgent,
			ipAddress,
			expiresAt,
		);

		return {
			access_token: accessToken,
			refresh_token: refreshToken,
		};
	}

	async validateUser(
		username: string,
		password: string,
	): Promise<ValidatedUser | null> {
		const user = await this.usersService.findByUsername(username);
		if (user && (await bcrypt.compare(password, user.password))) {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { password, ...result } = user;
			return result;
		}
		return null;
	}

	async refreshTokens(refreshToken: string, req: Request) {
		console.log(refreshToken);

		const session =
			await this.sessionService.findSessionByRefreshToken(refreshToken);
		console.log(session);

		if (!session) {
			throw new UnauthorizedException('Invalid refresh token');
		}
		if (session.expiresAt < new Date()) {
			await this.sessionService.deleteSession(session.accessTokenHash);
			throw new UnauthorizedException('Session expired');
		}
		await this.sessionService.deleteSession(session.accessTokenHash);

		const user = session.user;
		//const user = await this.usersService.findById(payload.userId);
		if (!user) {
			throw new Error('user not found');
		}
		const newPayload = { username: user.username, id: user.id };

		const newAccessToken = this.jwtService.sign(newPayload, {
			secret: jwtConstants.access_secret,
			expiresIn: jwtConstants.access_expires_in,
		});

		const newRefreshToken = this.jwtService.sign(newPayload, {
			secret: jwtConstants.refresh_secret,
			expiresIn: jwtConstants.refresh_expires_in,
		});

		const userAgent = req.headers['user-agent']
			? req.headers['user-agent']
			: '';
		const ipAddress = req.headers.host ? req.headers.host : '';
		const expiresAt = new Date(
			Date.now() +
				Number.parseInt(
					jwtConstants.refresh_expires_in.slice(
						0,
						jwtConstants.refresh_expires_in.length - 1,
					),
				) *
					24 *
					60 *
					60 *
					1000,
		);

		await this.sessionService.createSession(
			user,
			newAccessToken,
			newRefreshToken,
			userAgent,
			ipAddress,
			expiresAt,
		);

		return {
			access_token: newAccessToken,
			refresh_token: refreshToken,
		};
	}

	async logout(accessToken: string) {
		await this.sessionService.deleteSession(accessToken);
		return { message: 'Successfully logged out' };
	}
}
