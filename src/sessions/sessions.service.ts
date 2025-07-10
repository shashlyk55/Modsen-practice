import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Session } from 'src/entities/session.entity';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';

@Injectable()
export class SessionsService {
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

	async deleteSession(accessToken: string) {
		await this.sessionRepository.delete({
			accessTokenHash: accessToken,
		});
	}

	async deleteAllSessionsForUser(userId: number) {
		const deletedSessions = await this.sessionRepository
			.createQueryBuilder()
			.delete()
			.where('userId = :userId', { userId })
			.execute();
		return deletedSessions.affected ? deletedSessions.affected : 0;
	}

	async cleanExpiredSessions() {
		const expiredSessions = await this.sessionRepository
			.createQueryBuilder()
			.delete()
			.where('expiresAt < :now', { now: new Date() })
			.execute();
		return expiredSessions.affected ? expiredSessions.affected : 0;
	}
}
