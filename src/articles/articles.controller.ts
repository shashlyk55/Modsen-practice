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
import { CreateArticleDTO } from './dto/create-article.dto';
import { UpdateArticleDTO } from './dto/update-article.dto';
import { ArticleOwnerGuard } from './guards/article-owner.guard';
import { ValidatedUser } from 'src/users/types/validated-user';

@UseGuards(AuthGuard('jwt-access'))
@Controller('articles')
export class ArticlesController {
	constructor(private articlesService: ArticlesService) {}

	@Get('/:id')
	@HttpCode(HttpStatus.OK)
	async getOne(@Req() req: Request) {
		const userId = (req.user as ValidatedUser).id;
		const articleId = parseInt(req.params.id);
		const article = await this.articlesService.findByIdWithReactions(
			articleId,
			userId,
		);

		if (article == null) {
			throw new NotFoundException('article not found');
		}

		return article;
	}

	@Get('/')
	@HttpCode(HttpStatus.OK)
	async getAll(@Req() req: Request) {
		const userId = (req.user as ValidatedUser).id;
		const articles =
			await this.articlesService.findAllWithReactions(userId);

		if (articles == null) {
			throw new HttpException(
				'articles not found',
				HttpStatus.NO_CONTENT,
			);
		}

		return articles;
	}

	@Get('/user/me')
	@HttpCode(HttpStatus.OK)
	async getCurrentUserArticles(@Req() req: Request) {
		const userId = (req.user as ValidatedUser).id;
		const articles = await this.articlesService.findByUserId(userId);

		if (articles == null) {
			throw new HttpException(
				'articles not found',
				HttpStatus.NO_CONTENT,
			);
		}

		return articles;
	}

	@Get('/user/:userId')
	@HttpCode(HttpStatus.OK)
	async getByUserId(@Req() req: Request) {
		const userId = parseInt(req.params.userId);
		const articles = await this.articlesService.findByUserId(userId);

		if (articles == null) {
			throw new HttpException(
				'articles not found',
				HttpStatus.NO_CONTENT,
			);
		}

		return articles;
	}

	@Post('/')
	@HttpCode(HttpStatus.CREATED)
	async create(@Req() req: Request, @Body() newArticleDto: CreateArticleDTO) {
		const userId = (req.user as ValidatedUser).id;
		const newArticle = await this.articlesService.create(
			newArticleDto,
			userId,
		);
		return newArticle;
	}

	@UseGuards(ArticleOwnerGuard)
	@Delete('/:id')
	@HttpCode(HttpStatus.OK)
	async delete(@Req() req: Request) {
		const articleId = parseInt(req.params.id);
		return await this.articlesService.delete(articleId);
	}

	@UseGuards(ArticleOwnerGuard)
	@Patch('/:id')
	@HttpCode(HttpStatus.OK)
	async edit(
		@Req() req: Request,
		@Body() updateArticleDto: UpdateArticleDTO,
	) {
		const articleId = parseInt(req.params.id);
		const updatedArticle = await this.articlesService.update(
			articleId,
			updateArticleDto,
		);
		return updatedArticle;
	}
}
