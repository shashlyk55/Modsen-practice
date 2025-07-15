import {
	IsOptional,
	IsArray,
	IsString,
	IsNumber,
	Max,
	Min,
} from 'class-validator';
import { AllowedTags } from 'src/tags/allowed-tags';

export class ArticleFilterDTO {
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	//tags?: AllowedTags[];
	'tags[]'?: AllowedTags[];

	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	//usernames?: string[];
	'usernames[]'?: string[];

	@IsOptional()
	@IsNumber()
	@Min(1)
	@Max(100)
	limit?: number = 10;

	@IsOptional()
	@IsNumber()
	@Min(1)
	page?: number = 1;
}
