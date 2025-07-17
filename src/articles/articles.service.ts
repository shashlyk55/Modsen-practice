import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Article } from 'src/entities/article.entity';
import { Repository } from 'typeorm';
import { CreateArticleDTO } from './dto/create-article.dto';
import { UpdateArticleDTO } from './dto/update-article.dto';
import { ReactionType } from 'src/reactions/reactions';
import { Reaction } from 'src/entities/reaction';
import { SearchArticleDTO } from './dto/search-article.dto';
import { FilterArticlesDTO } from './dto/article-filter.dto';
import { articleFields } from './constants/select-fields';

@Injectable()
export class ArticlesService {
	constructor(
		@InjectRepository(Article)
		private articlesRepository: Repository<Article>,
	) {}

	async create(newArticleData: CreateArticleDTO, authorId: number) {
		const createdArticle = this.articlesRepository.create({
			...newArticleData,
			authorId,
		});

		return await this.articlesRepository.save(createdArticle);
	}

	async delete(id: number) {
		const result = await this.articlesRepository.delete({ id });
		if (!result.affected) {
			throw new NotFoundException('article not found');
		}
	}

	async update(articleId: number, newArticleData: UpdateArticleDTO) {
		await this.findById(articleId);

		const article = await this.articlesRepository.preload({
			id: articleId,
			...newArticleData,
		});

		if (article == undefined) {
			throw new HttpException('Article not updated', 500);
		}

		return article;
	}

	async findById(articleId: number) {
		const article = await this.articlesRepository.findOne({
			where: { id: articleId },
		});

		if (article == null) {
			throw new NotFoundException('Article not found');
		}

		return article;
	}

	async findByUserId(userId: number) {
		const articles = await this.articlesRepository
			.createQueryBuilder('article')
			.leftJoinAndSelect('article.author', 'user')
			.leftJoinAndSelect('article.tags', 'tags')
			.leftJoinAndSelect('article.reactions', 'reactions')
			.where('article.authorId = :userId', { userId })
			.select(articleFields)
			.orderBy('article.createdAt', 'ASC')
			.getMany();

		return articles.map((article) => {
			return {
				...article,
				...this.CountArticleReactions(article, userId),
			};
		});
	}

	async findByIdWithAdditions(articleId: number, currentUserId: number) {
		const article = await this.articlesRepository
			.createQueryBuilder('article')
			.leftJoinAndSelect('article.author', 'user')
			.leftJoinAndSelect('article.tags', 'tags')
			.leftJoinAndSelect('article.reactions', 'reactions')
			.where('article.id = :articleId', { articleId })
			.select(articleFields)
			.getOne();

		if (article == null) {
			throw new NotFoundException('Article not found');
		}

		return {
			...article,
			...this.CountArticleReactions(article, currentUserId),
		};
	}

	async findAllWithAdditions(currentUserId: number) {
		const articles = await this.articlesRepository
			.createQueryBuilder('article')
			.leftJoinAndSelect('article.author', 'user')
			.leftJoinAndSelect('article.tags', 'tags')
			.leftJoinAndSelect('article.reactions', 'reactions')
			.select(articleFields)
			.orderBy('article.createdAt', 'ASC')
			.getMany();

		return articles.map((article) => {
			return {
				...article,
				...this.CountArticleReactions(article, currentUserId),
			};
		});
	}

	private CountArticleReactions(article: Article, currentUserId: number) {
		const reactionsCount =
			article?.reactions?.reduce(
				(acc, reaction) => {
					acc[reaction.type] = (acc[reaction.type] || 0) + 1;
					return acc;
				},
				{} as Record<ReactionType, number>,
			) || {};

		const currentUserReaction: Reaction | undefined =
			article?.reactions.find(
				(reaction) => reaction.userId == currentUserId,
			);

		return {
			reactions: reactionsCount,
			currentUserReaction: currentUserReaction?.type || null,
		};
	}

	async search(searchDto: SearchArticleDTO) {
		const { q: query, page = 1, limit = 10 } = searchDto;

		const [items, total] = await this.articlesRepository
			.createQueryBuilder('article')
			.leftJoinAndSelect('article.author', 'user')
			.leftJoinAndSelect('article.tags', 'tags')
			.leftJoinAndSelect('article.reactions', 'reactions')
			.select(articleFields)
			.where(
				'article.header ILIKE :query OR article.description ILIKE :query',
				{ query: `%${query}%` },
			)
			.orderBy('article.createdAt', 'DESC')
			.skip((page - 1) * limit)
			.take(limit)
			.getManyAndCount();

		const totalPages = Math.ceil(total / limit);

		return {
			items,
			meta: {
				totalItems: total,
				itemCount: items.length,
				itemsPerPage: limit,
				totalPages,
				currentPage: page,
			},
		};
	}

	async filter(filterDto: FilterArticlesDTO) {
		const { tags, page = 1, limit = 10 } = filterDto;

		const query = this.articlesRepository
			.createQueryBuilder('article')
			.leftJoinAndSelect('article.author', 'user')
			.leftJoinAndSelect('article.tags', 'tags')
			.leftJoinAndSelect('article.reactions', 'reactions')
			.orderBy('article.createdAt', 'DESC')
			.skip((page - 1) * limit)
			.take(limit);

		if (tags && tags.length > 0) {
			query.innerJoin(
				'article.tags',
				'filterTag',
				'filterTag.name IN (:...tags)',
				{ tags },
			);
		}
		query.select(articleFields);

		const [items, total] = await query.getManyAndCount();

		const totalPages = Math.ceil(total / limit);

		return {
			items,
			meta: {
				totalItems: total,
				itemCount: items.length,
				itemsPerPage: limit,
				totalPages,
				currentPage: page,
			},
		};
	}
}
