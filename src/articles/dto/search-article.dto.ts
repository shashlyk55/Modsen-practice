import { Type } from 'class-transformer';
import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';

export class SearchArticleDTO {
	constructor(q: string, page?: number, limit?: number) {
		this.q = q;
		if (page) this.page = page;
		if (limit) this.limit = limit;
	}

	@IsString()
	q: string;

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	page?: number = 1;

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(100)
	limit?: number = 10;
}
