import { Module } from '@nestjs/common';
import { ReactionsService } from './reactions.service';
import { ReactionsController } from './reactions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reaction } from 'src/entities/reaction';
import { ArticlesModule } from 'src/articles/articles.module';

@Module({
	imports: [TypeOrmModule.forFeature([Reaction]), ArticlesModule],
	controllers: [ReactionsController],
	providers: [ReactionsService],
})
export class ReactionsModule {}
