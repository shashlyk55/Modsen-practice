import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { ArticlesService } from '../articles.service';
import { Request } from 'express';
import { ValidatedUser } from 'src/users/types/validated-user';

@Injectable()
export class ArticleOwnerGuard implements CanActivate {
	constructor(private articleService: ArticlesService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest<Request>();
		const articleId = parseInt(request.params.articleId);
		const userId = (request.user as ValidatedUser).id;

		if (!userId) {
			throw new ForbiddenException('user not authentificated');
		}

		const article = await this.articleService.findById(articleId);

		if (!article) {
			throw new NotFoundException('article not found');
		}

		if (article.authorId !== userId) {
			throw new ForbiddenException(
				'not enough permission to modify this article',
			);
		}

		return true;
	}
}
