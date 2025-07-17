import { ReactionType } from '../reactions';

export class CreateReactionDTO {
	constructor(reaction: ReactionType) {
		this.reaction = reaction;
	}
	reaction: ReactionType;
}
