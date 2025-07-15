import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateArticleDTO {
	constructor(header: string, description: string) {
		this.header = header;
		this.description = description;
	}

	@IsString()
	@IsNotEmpty()
	@MaxLength(100)
	header: string;

	@IsString()
	@IsNotEmpty()
	@MaxLength(1000)
	description: string;
}
