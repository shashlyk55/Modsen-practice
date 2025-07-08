import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ArticlesService } from 'src/articles/articles.service';
import { Comment } from 'src/entities/comment.entity';
import { Repository } from 'typeorm';
import { CreateCommentDTO } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
	constructor(
		@InjectRepository(Comment)
		private commentsRepository: Repository<Comment>,
		private articlesService: ArticlesService,
	) {}

	async findById(id: number) {
		const comment = await this.commentsRepository.findOne({
			where: { id },
		});
		return comment;
	}

	async findAllForArticle(articleId: number) {
		const comments = await this.commentsRepository.find({
			where: { article: { id: articleId } },
		});

		return comments;
	}

	async create(
		articleId: number,
		createCommentDto: CreateCommentDTO,
		authorId: number,
	) {
		const article = await this.articlesService.findById(articleId);
		if (!article) {
			throw new NotFoundException('article not found');
		}

		const comment = this.commentsRepository.create({
			...createCommentDto,
			authorId,
			articleId,
		});

		return this.commentsRepository.save(comment);
	}

	async delete(id: number) {
		const result = await this.commentsRepository.delete({ id });
		if (!result.affected) {
			throw new NotFoundException('comment not found');
		}
	}
}
