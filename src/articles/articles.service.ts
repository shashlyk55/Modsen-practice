import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Article } from 'src/entities/article.entity';
import { Repository } from 'typeorm';
import { CreateArticleDTO } from './dto/create-article.dto';
import { UpdateArticleDTO } from './dto/update-article.dto';
import { ReactionType } from 'src/reactions/reactions';
import { Reaction } from 'src/entities/reaction';
import { SearchArticleDTO } from './dto/search-article.dto';
import { FilterArticlesDTO } from './dto/article-filter.dto';
// import { Tag } from 'src/entities/tag.entity';
// import { AllowedTags } from 'src/tags/allowed-tags';

@Injectable()
export class ArticlesService {
	constructor(
		@InjectRepository(Article)
		private articlesRepository: Repository<Article>,
	) {}

	async findByIdWithAdditions(articleId: number, currentUserId: number) {
		const article = await this.articlesRepository.findOne({
			where: { id: articleId },
			relations: {
				reactions: true,
				tags: true,
			},
		});

		const currentUserReaction: Reaction | undefined =
			article?.reactions.find(
				(reaction) => reaction.userId == currentUserId,
			);

		const reactionCounts =
			article?.reactions?.reduce(
				(acc, reaction) => {
					acc[reaction.type] = (acc[reaction.type] || 0) + 1;
					return acc;
				},
				{} as Record<ReactionType, number>,
			) || {};

		return {
			...article,
			reactions: reactionCounts,
			currentUserReaction: currentUserReaction?.type || null,
		};
	}

	async findById(articleId: number) {
		const article = await this.articlesRepository.findOne({
			where: { id: articleId },
		});

		return article;
	}

	async findAll() {
		const articles = await this.articlesRepository.find({
			order: { createdAt: 'DESC' },
		});
		return articles;
	}

	async findAllWithAdditions(currentUserId: number) {
		const articles = await this.articlesRepository.find({
			relations: { reactions: true, tags: true },
			order: { createdAt: 'DESC' },
		});

		articles.sort((a, b) => b.reactions.length - a.reactions.length);

		return articles.map((article) => {
			const currentUserReaction = article.reactions?.find(
				(reaction) => reaction.userId === currentUserId,
			);

			const reactionCounts =
				article.reactions?.reduce(
					(acc, reaction) => {
						acc[reaction.type] = (acc[reaction.type] || 0) + 1;
						return acc;
					},
					{} as Record<ReactionType, number>,
				) || {};

			return {
				...article,
				reactions: reactionCounts,
				currentUserReaction: currentUserReaction?.type || null,
			};
		});
	}

	async findByUserId(userId: number) {
		const articles = await this.articlesRepository.find({
			where: { authorId: userId },
		});

		return articles;
	}

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

	async update(id: number, newArticleData: UpdateArticleDTO) {
		const article = await this.articlesRepository.preload({
			id,
			...newArticleData,
		});
		return article;
	}

	async search(searchDto: SearchArticleDTO) {
		const { q: query, page = 1, limit = 10 } = searchDto;

		const [items, total] = await this.articlesRepository
			.createQueryBuilder('article')
			.leftJoinAndSelect('article.author', 'author')
			.leftJoinAndSelect('article.tags', 'tags')
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
			.leftJoinAndSelect('article.author', 'author')
			.leftJoinAndSelect('article.tags', 'tags')
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

		const [items, total] = await query.getManyAndCount();

		return {
			items,
			meta: {
				totalItems: total,
				itemCount: items.length,
				itemsPerPage: limit,
				totalPages: Math.ceil(total / limit),
				currentPage: page,
			},
		};
	}
}
