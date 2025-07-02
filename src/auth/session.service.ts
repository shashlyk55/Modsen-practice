import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Session } from 'src/entities/session.entity';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';

@Injectable()
export class SessionService {
	constructor(
		@InjectRepository(Session)
		private sessionRepository: Repository<Session>,
	) {}

	async createSession(
		user: User,
		accessToken: string,
		refreshToken: string,
		userAgent: string,
		ipAddress: string,
		expiresAt: Date,
	): Promise<Session> {
		const session = this.sessionRepository.create({
			accessTokenHash: accessToken,
			refreshTokenHash: refreshToken,
			userAgent,
			ipAddress,
			expiresAt,
			user,
		});
		return this.sessionRepository.save(session);
	}

	async findSessionByRefreshToken(
		refreshToken: string,
	): Promise<Session | null> {
		//console.log(await this.hashToken(refreshToken));

		return this.sessionRepository.findOne({
			where: { refreshTokenHash: refreshToken },
			relations: ['user'],
		});
	}

	async findSessionByAccessToken(
		accessToken: string,
	): Promise<Session | null> {
		return this.sessionRepository.findOne({
			where: { accessTokenHash: accessToken },
			relations: ['user'],
		});
	}

	async deleteSession(accessToken: string): Promise<void> {
		await this.sessionRepository.delete({
			accessTokenHash: accessToken,
		});
	}

	async deleteAllSessionsForUser(userId: number): Promise<void> {
		await this.sessionRepository
			.createQueryBuilder()
			.delete()
			.where('userId = :userId', { userId })
			.execute();
	}

	async cleanExpiredSessions(): Promise<void> {
		await this.sessionRepository
			.createQueryBuilder()
			.delete()
			.where('expiresAt < :now', { now: new Date() })
			.execute();
	}
}
