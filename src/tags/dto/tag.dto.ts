import { IsEnum } from 'class-validator';
import { AllowedTags } from '../allowed-tags';

export class TagDTO {
	constructor(name: AllowedTags) {
		this.name = name;
	}
	@IsEnum(AllowedTags)
	name: AllowedTags;
}
