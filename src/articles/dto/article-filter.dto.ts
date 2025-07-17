import { Transform, Type } from 'class-transformer';
import { IsOptional, IsArray, IsEnum, IsInt, Min, Max } from 'class-validator';
import { AllowedTags } from 'src/tags/allowed-tags';

export class FilterArticlesDTO {
	@IsOptional()
	@IsArray()
	@IsEnum(AllowedTags, { each: true })
	@Transform(({ value }) =>
		typeof value === 'string'
			? ([value] as AllowedTags[])
			: (value as AllowedTags[]),
	)
	tags?: AllowedTags[];

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
