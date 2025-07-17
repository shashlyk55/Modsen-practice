import {
	Body,
	Controller,
	Get,
	Param,
	ParseIntPipe,
	Post,
	Query,
	Req,
	UseGuards,
} from '@nestjs/common';
import { TagsService } from './tags.service';
import { TagDTO } from './dto/tag.dto';
import { ArticleOwnerGuard } from 'src/articles/guards/article-owner.guard';
import { AuthGuard } from '@nestjs/passport';
import { ArticleExistsGuard } from 'src/articles/guards/article-exists.guard';
import { Request } from 'express';
import { ValidatedUser } from 'src/users/types/validated-user';

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

	@UseGuards(ArticleExistsGuard, ArticleOwnerGuard)
	@Post('/:articleId')
	async replaceArticleTags(
		@Req() req: Request,
		@Param('articleId', ParseIntPipe) articleId: number,
		@Body() tags: TagDTO[],
	) {
		const userId = (req.user as ValidatedUser).id;
		const article = await this.tagsService.replaceTags(
			articleId,
			userId,
			tags,
		);
		return article;
	}
}
