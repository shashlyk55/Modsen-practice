import {
	Body,
	Controller,
	Delete,
	Get,
	Post,
	Req,
	UseGuards,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDTO } from './dto/create-comment.dto';
import { Request } from 'express';
import { User } from 'src/entities/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { CommentOwnerGuard } from './guards/comment-owner.guard';

@UseGuards(AuthGuard('jwt-access'))
@Controller('articles/:articleId/comments')
export class CommentsController {
	constructor(private commentsService: CommentsService) {}

	@Post('/')
	async create(
		@Body() createCommentData: CreateCommentDTO,
		@Req() req: Request,
	) {
		const articleId = +req.params.articleId;
		const authorId = +(req.user as User).id;

		const article = await this.commentsService.create(
			articleId,
			createCommentData,
			authorId,
		);
		return article;
	}

	@Get('/')
	async getAllForArticle(@Req() req: Request) {
		const articleId = +req.params.articleId;
		const comments =
			await this.commentsService.findAllForArticle(articleId);
		return comments;
	}

	@UseGuards(CommentOwnerGuard)
	@Delete('/:commentId')
	async delete(@Req() req: Request) {
		const commentId = +req.params.commentId;
		return await this.commentsService.delete(commentId);
	}
}
