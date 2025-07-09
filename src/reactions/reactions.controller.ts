import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ReactionsService } from './reactions.service';
import { Request } from 'express';
import { ValidatedUser } from 'src/users/types/validated-user';
import { ReactionType } from './reactions';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt-access'))
@Controller('reactions')
export class ReactionsController {
	constructor(private readonly reactionsService: ReactionsService) {}

	@Get('/')
	getAllReactions() {
		const reactions = this.reactionsService.getAllReactions();
		return reactions;
	}

	// @Get('/:articleId')
	// async getArticleReactions(@Req() req: Request) {
	// 	const articleId = parseInt(req.params.articleId);
	// 	const userId = (req.user as ValidatedUser).id;
	// 	const reactions = await this.reactionsService.getArticleReactions(
	// 		articleId,
	// 		userId,
	// 	);
	// 	return reactions;
	// }

	@Post('/:articleId')
	async addReaction(
		@Req() req: Request,
		@Body('reaction') type: ReactionType,
	) {
		const articleId = parseInt(req.params.articleId);
		const userId = (req.user as ValidatedUser).id;
		const article = await this.reactionsService.addReaction(
			articleId,
			userId,
			type,
		);
		return article;
	}
}
