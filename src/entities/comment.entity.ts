import {
	Column,
	CreateDateColumn,
	Entity,
	ManyToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Article } from './article.entity';

@Entity()
export class Comment {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	text: string;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;

	@ManyToOne(() => User, (user) => user.comments, { onDelete: 'CASCADE' })
	author: User;

	@Column()
	authorId: number;

	@ManyToOne(() => Article, (article) => article.comments, {
		onDelete: 'CASCADE',
	})
	article: Article;

	@Column()
	articleId: number;
}
