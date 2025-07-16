import {
	Body,
	Controller,
	Get,
	Param,
	ParseIntPipe,
	Post,
	Req,
	UseGuards,
} from '@nestjs/common';
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

	@Post('/:articleId')
	async addReaction(
		@Param('articleId', ParseIntPipe) articleId: number,
		@Req() req: Request,
		@Body('reaction') type: ReactionType,
	) {
		const userId = (req.user as ValidatedUser).id;
		const article = await this.reactionsService.addReaction(
			articleId,
			userId,
			type,
		);
		return article;
	}
}
