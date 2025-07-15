import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tag } from 'src/entities/tag.entity';
import { Repository } from 'typeorm';
import { TagDTO } from './dto/tag.dto';
import { ArticlesService } from 'src/articles/articles.service';
import { AllowedTags } from './allowed-tags';

@Injectable()
export class TagsService {
	constructor(
		@InjectRepository(Tag)
		private tagsRepository: Repository<Tag>,
		private articlesService: ArticlesService,
	) {}

	getAllTags() {
		return Object.values(AllowedTags);
	}

	searchTags(query: string) {
		const allTags = this.getAllTags();
		return allTags.filter((tag) =>
			tag.toLowerCase().includes(query.toLowerCase()),
		);
	}

	private async clearArticleTags(articleId: number) {
		await this.tagsRepository
			.createQueryBuilder()
			.delete()
			.where('articleId = :articleId', { articleId })
			.execute();
	}

	async replaceTags(articleId: number, tagDtos: TagDTO[] = []) {
		await this.clearArticleTags(articleId);

		for (const tagDto of tagDtos) {
			const tag = this.tagsRepository.create({
				name: tagDto.name,
				articleId: articleId,
			});
			await this.tagsRepository.save(tag);
		}
		const article = await this.articlesService.findById(articleId);
		return article;
	}
}
