import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCommentDTO {
	constructor(text: string) {
		this.text = text;
	}

	@IsString()
	@IsNotEmpty()
	@MaxLength(200)
	text: string;
}
