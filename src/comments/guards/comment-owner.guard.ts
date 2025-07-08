import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { User } from 'src/entities/user.entity';
import { CommentsService } from '../comments.service';

@Injectable()
export class CommentOwnerGuard implements CanActivate {
	constructor(private commentsService: CommentsService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest<Request>();
		const commentId = +request.params.commentId;
		const userId = (request.user as User).id;

		const comment = await this.commentsService.findById(commentId);

		if (comment?.authorId != userId) {
			throw new ForbiddenException(
				'not enough permissions to modified this comment',
			);
		}

		return true;
	}
}
