import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { CommentsService } from '../comments.service';
import { ValidatedUser } from 'src/users/types/validated-user';

@Injectable()
export class CommentOwnerGuard implements CanActivate {
	constructor(private commentsService: CommentsService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest<Request>();
		const commentId = parseInt(request.params.commentId);
		const userId = (request.user as ValidatedUser).id;

		const comment = await this.commentsService.findById(commentId);

		if (comment?.authorId != userId) {
			throw new ForbiddenException(
				'not enough permissions to modified this comment',
			);
		}

		return true;
	}
}
