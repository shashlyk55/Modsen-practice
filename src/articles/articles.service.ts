import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Article } from 'src/entities/article.entity';
import { Repository } from 'typeorm';
import { CreateArticleDTO } from './dto/create-article.dto';
import { UpdateArticleDTO } from './dto/update-article.dto';

@Injectable()
export class ArticlesService {
	constructor(
		@InjectRepository(Article)
		private articlesRepository: Repository<Article>,
	) {}

	async findById(id: number) {
		const article = await this.articlesRepository.findOne({
			where: { id },
		});
		return article;
	}

	async findAll() {
		const articles = await this.articlesRepository.find();
		return articles;
	}

	async findByUserId(userId: number) {
		const articles = await this.articlesRepository.find({
			where: { authorId: userId },
		});
		return articles;
	}

	async create(newArticleData: CreateArticleDTO, authorId: number) {
		const createdArticle = this.articlesRepository.create({
			...newArticleData,
			authorId,
		});

		return await this.articlesRepository.save(createdArticle);
	}

	async delete(id: number) {
		const result = await this.articlesRepository.delete({ id });
		if (!result.affected) {
			throw new NotFoundException('article not found');
		}
	}

	async update(id: number, newArticleData: UpdateArticleDTO) {
		const article = await this.articlesRepository.preload({
			id,
			...newArticleData,
		});
		return article;
	}
}
