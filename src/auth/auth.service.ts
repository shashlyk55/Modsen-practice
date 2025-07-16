import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { RegisterUserDTO } from '../users/dto/register-user.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ValidatedUser } from 'src/users/types/validated-user';
import { SessionsService } from '../sessions/sessions.service';
import { Request } from 'express';
import { User } from 'src/entities/user.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
	constructor(
		private usersService: UsersService,
		private jwtService: JwtService,
		private sessionService: SessionsService,
		private config: ConfigService,
	) {}

	async register(registerUserDto: RegisterUserDTO) {
		const user = await this.usersService.create(registerUserDto);
		return user;
	}

	async login(user: User | undefined | null, req: Request) {
		if (!user) {
			throw new UnauthorizedException();
		}
		const payload: ValidatedUser = { username: user.username, id: user.id };

		const userAgent = req.headers['user-agent']
			? req.headers['user-agent']
			: '';
		const ipAddress = req.ip ? req.ip : '';
		const refreshTokenExpiresIn = Number.parseInt(
			this.config
				.getOrThrow<string>('REFRESH_TOKEN_EXPIRES_IN')
				.slice(
					0,
					this.config.getOrThrow<string>('REFRESH_TOKEN_EXPIRES_IN')
						.length - 1,
				),
		);
		const expiresAt = new Date(
			Date.now() + refreshTokenExpiresIn * 24 * 60 * 60 * 1000,
		);

		const accessToken = this.jwtService.sign(payload, {
			secret: this.config.getOrThrow<string>('ACCESS_TOKEN_SECRET'),
			expiresIn: this.config.getOrThrow<string>(
				'ACCESS_TOKEN_EXPIRES_IN',
			),
		});

		const refreshToken = this.jwtService.sign(payload, {
			secret: this.config.getOrThrow<string>('REFRESH_TOKEN_SECRET'),
			expiresIn: this.config.getOrThrow<string>(
				'REFRESH_TOKEN_EXPIRES_IN',
			),
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

		const user = session.user;
		//const user = await this.usersService.findById(payload.userId);
		if (!user) {
			throw new Error('user not found');
		}
		const newPayload: ValidatedUser = {
			username: user.username,
			id: user.id,
		};

		const newAccessToken = this.jwtService.sign(newPayload, {
			secret: this.config.getOrThrow<string>('ACCESS_TOKEN_SECRET'),
			expiresIn: this.config.getOrThrow<string>(
				'ACCESS_TOKEN_EXPIRES_IN',
			),
		});

		const newRefreshToken = this.jwtService.sign(newPayload, {
			secret: this.config.getOrThrow<string>('REFRESH_TOKEN_SECRET'),
			expiresIn: this.config.getOrThrow<string>(
				'REFRESH_TOKEN_EXPIRES_IN',
			),
		});

		const userAgent = req.headers['user-agent']
			? req.headers['user-agent']
			: '';
		const ipAddress = req.headers.host ? req.headers.host : '';
		const expiresAt = new Date(
			Date.now() +
				Number.parseInt(
					this.config
						.getOrThrow<string>('REFRESH_TOKEN_EXPIRES_IN')
						.slice(
							0,
							this.config.getOrThrow<string>(
								'REFRESH_TOKEN_EXPIRES_IN',
							).length - 1,
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

	async logout(accessToken: string | undefined) {
		if (!accessToken) {
			throw new UnauthorizedException('token not found');
		}
		await this.sessionService.deleteSession(accessToken);
		return { message: 'successfully logged out' };
	}
}
