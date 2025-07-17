import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ArticlesService } from '../articles.service';
import { Request } from 'express';

@Injectable()
export class ArticleExistsGuard implements CanActivate {
	constructor(private articleService: ArticlesService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest<Request>();
		const articleId = parseInt(request.params.articleId);

		await this.articleService.findById(articleId);

		return true;
	}
}
