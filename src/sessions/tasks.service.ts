import { Injectable } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { Cron } from '@nestjs/schedule/dist/decorators/cron.decorator';
import { CronExpression } from '@nestjs/schedule/dist/enums/cron-expression.enum';

@Injectable()
export class TasksService {
	constructor(private sessionService: SessionsService) {}

	@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
	async cleanupSessions() {
		await this.sessionService.cleanExpiredSessions();
	}
}
