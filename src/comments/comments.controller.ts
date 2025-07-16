import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseIntPipe,
	Post,
	Req,
	UseGuards,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDTO } from './dto/create-comment.dto';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { CommentOwnerGuard } from './guards/comment-owner.guard';
import { ValidatedUser } from 'src/users/types/validated-user';

@UseGuards(AuthGuard('jwt-access'))
@Controller('articles/:articleId/comments')
export class CommentsController {
	constructor(private commentsService: CommentsService) {}

	@Post('/')
	async create(
		@Param('articleId', ParseIntPipe) articleId: number,
		@Body() createCommentData: CreateCommentDTO,
		@Req() req: Request,
	) {
		//const articleId = +req.params.articleId;
		const authorId = (req.user as ValidatedUser).id;

		const article = await this.commentsService.create(
			articleId,
			createCommentData,
			authorId,
		);
		return article;
	}

	@Get('/')
	async getAllForArticle(
		@Param('articleId', ParseIntPipe) articleId: number,
	) {
		//const articleId = +req.params.articleId;
		const comments =
			await this.commentsService.findAllForArticle(articleId);
		return comments;
	}

	@UseGuards(CommentOwnerGuard)
	@Delete('/:commentId')
	async delete(
		@Param('articleId', ParseIntPipe) articleId: number,
		@Param('commentId', ParseIntPipe) commentId: number,
	) {
		//const commentId = +req.params.commentId;
		return await this.commentsService.delete(commentId);
	}
}
