import { ReactionType } from 'src/reactions/reactions';
import {
	Column,
	CreateDateColumn,
	Entity,
	ManyToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { Article } from './article.entity';
import { User } from './user.entity';

@Entity()
export class Reaction {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column({ type: 'enum', enum: ReactionType })
	type!: ReactionType;

	@ManyToOne(() => User, (user) => user.reactions, { onDelete: 'CASCADE' })
	user!: User;

	@Column()
	userId!: number;

	@ManyToOne(() => Article, (article) => article.reactions, {
		onDelete: 'CASCADE',
	})
	article!: Article;

	@Column()
	articleId!: number;

	@CreateDateColumn()
	createdAt!: Date;
}
