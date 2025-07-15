import {
	Body,
	Controller,
	Get,
	Param,
	ParseIntPipe,
	Post,
	Query,
	UseGuards,
} from '@nestjs/common';
import { TagsService } from './tags.service';
import { TagDTO } from './dto/tag.dto';
import { ArticleOwnerGuard } from 'src/articles/guards/article-owner.guard';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt-access'))
@Controller('tags')
export class TagsController {
	constructor(private readonly tagsService: TagsService) {}

	@Get('/')
	getAllTags() {
		const tags = this.tagsService.getAllTags();
		return tags;
	}

	@Get('/search')
	searchTags(@Query('query') query: string) {
		const tags = this.tagsService.searchTags(query);
		return tags;
	}

	@UseGuards(ArticleOwnerGuard)
	@Post('/:articleId')
	async replaceArticleTags(
		@Param('articleId', ParseIntPipe) articleId: number,
		@Body() tags: TagDTO[],
	) {
		const article = await this.tagsService.replaceTags(articleId, tags);
		return article;
	}
}
