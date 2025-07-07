import { Module } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { ArticlesController } from './articles.controller';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { Article } from 'src/entities/article.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Article])],
	controllers: [ArticlesController],
	providers: [ArticlesService],
})
export class ArticlesModule {}
