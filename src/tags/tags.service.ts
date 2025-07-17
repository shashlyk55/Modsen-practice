import { HttpException, Injectable } from '@nestjs/common';
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
		await this.tagsRepository.delete({ articleId });
	}

	async replaceTags(
		articleId: number,
		userId: number,
		tagDtos: TagDTO[] = [],
	) {
		if (tagDtos.length > 3) {
			throw new HttpException('max 3 tags in article', 400);
		}

		await this.clearArticleTags(articleId);

		for (const tagDto of tagDtos) {
			const tag = this.tagsRepository.create({
				name: tagDto.name,
				articleId: articleId,
			});
			await this.tagsRepository.save(tag);
		}
		const article = await this.articlesService.findByIdWithAdditions(
			articleId,
			userId,
		);
		return article;
	}
}
