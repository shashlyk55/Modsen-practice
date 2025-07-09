import {
	Column,
	CreateDateColumn,
	Entity,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Comment } from './comment.entity';
import { Reaction } from './reaction';

@Entity()
export class Article {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	header: string;

	@Column()
	description: string;

	@ManyToOne(() => User, (user) => user.articles, { onDelete: 'CASCADE' })
	author: User;

	@Column()
	authorId: number;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;

	@OneToMany(() => Comment, (comment) => comment.article, {
		onDelete: 'CASCADE',
	})
	comments: Comment[];

	@OneToMany(() => Reaction, (reaction) => reaction.article, {
		onDelete: 'CASCADE',
	})
	reactions: Reaction[];
}
