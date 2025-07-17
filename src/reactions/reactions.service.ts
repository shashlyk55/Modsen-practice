import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ArticlesService } from 'src/articles/articles.service';
import { Reaction } from 'src/entities/reaction';
import { ReactionType } from 'src/reactions/reactions';
import { Repository } from 'typeorm';

@Injectable()
export class ReactionsService {
	constructor(
		@InjectRepository(Reaction)
		private reactionsRepository: Repository<Reaction>,
		private articlesService: ArticlesService,
	) {}

	getAllReactions() {
		const reactionTypes = Object.values(ReactionType);
		return reactionTypes;
	}

	async addReaction(articleId: number, userId: number, type: ReactionType) {
		const existingReaction = await this.reactionsRepository.findOne({
			where: {
				userId: userId,
				articleId: articleId,
			},
		});

		if (existingReaction) {
			if (existingReaction.type === type) {
				return this.deleteReaction(articleId, userId);
			}
			return this.changeReactionType(articleId, userId, type);
		}
		const reaction = this.reactionsRepository.create({
			userId: userId,
			articleId: articleId,
			type: type,
		});
		await this.reactionsRepository.save(reaction);

		return this.articlesService.findByIdWithAdditions(articleId, userId);
	}

	private async deleteReaction(articleId: number, userId: number) {
		const reaction = await this.reactionsRepository.findOne({
			where: {
				userId: userId,
				articleId: articleId,
			},
		});
		if (reaction == null) {
			throw new NotFoundException('article not found');
		}

		await this.reactionsRepository.delete({
			userId: userId,
			articleId: articleId,
		});

		return this.articlesService.findByIdWithAdditions(articleId, userId);
	}

	private async changeReactionType(
		articleId: number,
		userId: number,
		newReaction: ReactionType,
	) {
		await this.reactionsRepository.update(
			{
				userId: userId,
				articleId: articleId,
			},
			{
				type: newReaction,
			},
		);

		return this.articlesService.findByIdWithAdditions(articleId, userId);
	}
}
