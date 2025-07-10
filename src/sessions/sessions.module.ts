import { Module } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Session } from 'src/entities/session.entity';
import { TasksService } from './tasks.service';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
	imports: [TypeOrmModule.forFeature([Session]), ScheduleModule.forRoot()],
	providers: [SessionsService, TasksService],
	exports: [SessionsService],
})
export class SessionsModule {}
