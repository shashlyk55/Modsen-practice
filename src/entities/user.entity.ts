import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	OneToMany,
	BeforeInsert,
	CreateDateColumn,
	UpdateDateColumn,
} from 'typeorm';
import { Article } from './article.entity';
import { Comment } from './comment.entity';
import * as bcrypt from 'bcrypt';
import { Session } from './session.entity';
import { Reaction } from './reaction';

@Entity()
export class User {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ unique: true })
	username: string;

	@Column()
	password: string;

	@BeforeInsert()
	async hashPassword() {
		this.password = await bcrypt.hash(this.password, 10);
	}

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;

	@OneToMany(() => Article, (article) => article.author, {
		onDelete: 'CASCADE',
	})
	articles: Article[];

	@OneToMany(() => Comment, (comment) => comment.author, {
		onDelete: 'CASCADE',
	})
	comments: Comment[];

	@OneToMany(() => Session, (session) => session.user, {
		onDelete: 'CASCADE',
	})
	sessions: Session[];

	@OneToMany(() => Reaction, (reaction) => reaction.user, {
		onDelete: 'CASCADE',
	})
	reactions: Reaction[];
}
