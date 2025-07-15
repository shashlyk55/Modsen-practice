import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Article } from 'src/entities/article.entity';
import { Repository } from 'typeorm';
import { CreateArticleDTO } from './dto/create-article.dto';
import { UpdateArticleDTO } from './dto/update-article.dto';
import { ReactionType } from 'src/reactions/reactions';
import { Reaction } from 'src/entities/reaction';
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

	// async filterArticles(filter: {
	// 	tags?: string[];
	// 	usernames?: string[];
	// 	page?: number;
	// 	limit?: number;
	// }) {
	// 	console.log(filter);

	// 	const { tags, usernames, page = 1, limit = 10 } = filter;

	// 	const where: any = {};

	// 	// Фильтрация по авторам
	// 	if (usernames?.length) {
	// 		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
	// 		where.author = { username: In(usernames) };
	// 	}

	// 	// Фильтрация по тегам
	// 	if (tags?.length) {
	// 		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
	// 		where.tags = { name: In(tags) };
	// 	}

	// 	const [articles, total] = await this.articlesRepository.findAndCount({
	// 		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	// 		where,
	// 		relations: ['author', 'tags'],
	// 		skip: (page - 1) * limit,
	// 		take: limit,
	// 	});

	// 	const filteredArticles = tags?.length
	// 		? articles.filter((article) =>
	// 				tags.every((tag: AllowedTags) =>
	// 					article.tags.some((t: Tag) => t.name === tag),
	// 				),
	// 			)
	// 		: articles;

	// 	return {
	// 		data: filteredArticles,
	// 		meta: {
	// 			total: filteredArticles.length,
	// 			page,
	// 			limit,
	// 			last_page: Math.ceil(total / limit),
	// 		},
	// 	};
	// }
}
