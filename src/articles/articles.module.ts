import { Module } from '@nestjs/common';
import { ArticlesService } from './articles.service';

@Module({
	imports: [],
	controllers: [],
	providers: [ArticlesService],
})
export class ArticlesModule {}
