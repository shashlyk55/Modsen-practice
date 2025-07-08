import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCommentDTO {
	@IsString()
	@IsNotEmpty()
	@MaxLength(200)
	text: string;
}
