import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { ArticlesService } from '../articles.service';
//import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { User } from 'src/entities/user.entity';

@Injectable()
export class ArticleOwnerGuard implements CanActivate {
	constructor(
		private articleService: ArticlesService,
		//private reflector: Reflector,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest<Request>();
		const articleId = +request.params.id;
		const userId = (request.user as User).id;

		if (!userId) {
			throw new ForbiddenException('user not authentificated');
		}

		const article = await this.articleService.findById(articleId);

		if (!article) {
			throw new NotFoundException('article not found');
		}

		if (article.author.id !== userId) {
			throw new ForbiddenException(
				'not enough permission to modify this article',
			);
		}

		return true;
	}
}
