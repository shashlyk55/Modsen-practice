import { Module } from '@nestjs/common';
import { TagsService } from './tags.service';
import { TagsController } from './tags.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tag } from 'src/entities/tag.entity';
import { ArticlesModule } from 'src/articles/articles.module';
import { Article } from 'src/entities/article.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Tag, Article]), ArticlesModule],
	controllers: [TagsController],
	providers: [TagsService],
	exports: [TagsService],
})
export class TagsModule {}
