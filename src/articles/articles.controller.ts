import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpException,
	HttpStatus,
	NotFoundException,
	Patch,
	Post,
	Req,
	UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { ArticlesService } from './articles.service';
import { NewArticleDTO } from './dto/new-article.dto';
import { User } from 'src/users/types/user';
import { UpdateArticleDTO } from './dto/update-article.dto';
import { ArticleOwnerGuard } from './guards/article-owner.guard';

@UseGuards(AuthGuard('jwt-access'))
@Controller('articles')
export class ArticlesController {
	constructor(private articlesService: ArticlesService) {}

	@Get('/:id')
	@HttpCode(HttpStatus.OK)
	async getOne(@Req() req: Request) {
		const articleId = +req.params.id;
		const article = await this.articlesService.findById(articleId);

		if (!article) {
			throw new NotFoundException('article not found');
		}

		return article;
	}

	@Get('/')
	@HttpCode(HttpStatus.OK)
	async getAll() {
		const articles = await this.articlesService.findAll();

		if (!articles) {
			throw new HttpException(
				'articles not found',
				HttpStatus.NO_CONTENT,
			);
		}

		return articles;
	}

	@Post('/')
	@HttpCode(HttpStatus.CREATED)
	async create(@Req() req: Request, @Body() newArticleDto: NewArticleDTO) {
		const newArticle = await this.articlesService.create(
			newArticleDto,
			req.user as User,
		);
		return newArticle;
	}

	@UseGuards(ArticleOwnerGuard)
	@Delete('/:id')
	@HttpCode(HttpStatus.OK)
	async delete(@Req() req: Request) {
		const articleId = +req.params.id;
		const deletedArticle = await this.articlesService.delete(articleId);
		return deletedArticle;
	}

	@UseGuards(ArticleOwnerGuard)
	@Patch('/:id')
	@HttpCode(HttpStatus.OK)
	async edit(
		@Req() req: Request,
		@Body() updateArticleDto: UpdateArticleDTO,
	) {
		const articleId = +req.params.id;
		const updatedArticle = await this.articlesService.edit(
			articleId,
			updateArticleDto,
		);
		return updatedArticle;
	}
}
