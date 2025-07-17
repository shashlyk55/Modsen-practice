import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ArticlesService } from 'src/articles/articles.service';
import { Comment } from 'src/entities/comment.entity';
import { Repository } from 'typeorm';
import { CreateCommentDTO } from './dto/create-comment.dto';
import { commentFields } from './constants/select-fields';

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

		if (comment == null) {
			throw new NotFoundException('Comment not found');
		}

		return comment;
	}

	async findAllForArticle(articleId: number) {
		const comments = await this.commentsRepository
			.createQueryBuilder('comment')
			.leftJoinAndSelect('comment.author', 'user')
			.select(commentFields)
			.where('comment.articleId = :articleId', { articleId })
			.getMany();

		return comments;
	}

	async create(
		articleId: number,
		createCommentDto: CreateCommentDTO,
		authorId: number,
	) {
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
