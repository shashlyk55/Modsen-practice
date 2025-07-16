import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpException,
	HttpStatus,
	NotFoundException,
	Param,
	ParseIntPipe,
	Patch,
	Post,
	Query,
	Req,
	UseGuards,
	ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { ArticlesService } from './articles.service';
import { CreateArticleDTO } from './dto/create-article.dto';
import { UpdateArticleDTO } from './dto/update-article.dto';
import { ArticleOwnerGuard } from './guards/article-owner.guard';
import { ValidatedUser } from 'src/users/types/validated-user';
import { SearchArticleDTO } from './dto/search-article.dto';
import { FilterArticlesDTO } from './dto/article-filter.dto';

@UseGuards(AuthGuard('jwt-access'))
@Controller('articles')
export class ArticlesController {
	constructor(private articlesService: ArticlesService) {}

	@Get('/search')
	@HttpCode(HttpStatus.OK)
	async search(
		@Query(new ValidationPipe({ transform: true }))
		searchDto: SearchArticleDTO,
	) {
		const articles = await this.articlesService.search(searchDto);

		if (articles == null) {
			throw new HttpException(
				'articles not found',
				HttpStatus.NO_CONTENT,
			);
		}

		return articles;
	}

	@Get('/filter')
	@HttpCode(HttpStatus.OK)
	async filter(
		@Query(new ValidationPipe({ transform: true }))
		filterDto: FilterArticlesDTO,
	) {
		const articles = await this.articlesService.filter(filterDto);

		if (articles == null) {
			throw new HttpException(
				'articles not found',
				HttpStatus.NO_CONTENT,
			);
		}

		return articles;
	}

	@Get('/:articleId')
	@HttpCode(HttpStatus.OK)
	async getOne(
		@Param('articleId', ParseIntPipe) articleId: number,
		@Req() req: Request,
	) {
		const userId = (req.user as ValidatedUser).id;
		const article = await this.articlesService.findByIdWithAdditions(
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
			await this.articlesService.findAllWithAdditions(userId);

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
	async getByUserId(@Param('userId', ParseIntPipe) userId: number) {
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
	@Delete('/:articleId')
	@HttpCode(HttpStatus.OK)
	async delete(@Param('articleId', ParseIntPipe) articleId: number) {
		return await this.articlesService.delete(articleId);
	}

	@UseGuards(ArticleOwnerGuard)
	@Patch('/:articleId')
	@HttpCode(HttpStatus.OK)
	async edit(
		@Param('articleId', ParseIntPipe) articleId: number,
		@Body() updateArticleDto: UpdateArticleDTO,
	) {
		const updatedArticle = await this.articlesService.update(
			articleId,
			updateArticleDto,
		);
		return updatedArticle;
	}
}
