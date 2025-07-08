import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateArticleDTO {
	@IsString()
	@IsNotEmpty()
	@MaxLength(100)
	header: string;

	@IsString()
	@IsNotEmpty()
	@MaxLength(1000)
	description: string;
}
