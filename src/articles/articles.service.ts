import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Article } from 'src/entities/article.entity';
import { Repository } from 'typeorm';
import { NewArticleDTO } from './dto/new-article.dto';
import { UpdateArticleDTO } from './dto/update-article.dto';
import { User } from 'src/users/types/user';

@Injectable()
export class ArticlesService {
	constructor(
		@InjectRepository(Article)
		private articlesRepository: Repository<Article>,
	) {}

	async findById(id: number) {
		const article = await this.articlesRepository.findOne({
			where: { id },
			relations: {
				author: true,
			},
		});
		return article;
	}

	async findAll() {
		const articles = await this.articlesRepository.find({
			relations: {
				author: true,
			},
		});
		return articles;
	}

	async create(newArticleData: NewArticleDTO, author: User) {
		const article = this.articlesRepository.create({
			...newArticleData,
			author,
		});
		return this.articlesRepository.save(article);
	}

	async delete(id: number) {
		const result = await this.articlesRepository.delete({ id });
		console.log(result);
		return result;
	}

	async edit(id: number, newArticleData: UpdateArticleDTO) {
		const article = await this.articlesRepository.update(
			{ id },
			newArticleData,
		);
		return article;
	}
}
