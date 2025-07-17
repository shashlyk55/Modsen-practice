import {
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { RegisterUserDTO } from '../users/dto/register-user.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ValidatedUser } from 'src/users/types/validated-user';
import { SessionsService } from '../sessions/sessions.service';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { Payload } from './types/payload';

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

	async login(user: ValidatedUser, req: Request) {
		const payload: Payload = { username: user.username, id: user.id };

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
			user.id,
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

	async refreshTokens(req: Request) {
		const user = req.user as ValidatedUser;

		if (!user) {
			throw new NotFoundException('user not found');
		}
		const newPayload: Payload = {
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

		await this.sessionService.createSession(
			user.id,
			newAccessToken,
			newRefreshToken,
			userAgent,
			ipAddress,
			expiresAt,
		);

		return {
			access_token: newAccessToken,
			refresh_token: newRefreshToken,
		};
	}

	async logout(req: Request) {
		const authHeader = req.headers.authorization;
		const accessToken = authHeader?.split(' ')[1].trim();
		console.log(req);

		if (!accessToken) {
			throw new UnauthorizedException('token not found');
		}

		await this.sessionService.deleteSession(accessToken);
		return { message: 'successfully logged out' };
	}
}
