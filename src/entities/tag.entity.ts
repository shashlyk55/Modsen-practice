import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Article } from './article.entity';
import { AllowedTags } from 'src/tags/allowed-tags';

@Entity()
export class Tag {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column({
		type: 'enum',
		enum: AllowedTags,
	})
	name!: AllowedTags;

	@ManyToOne(() => Article, (article) => article.tags, {
		onDelete: 'CASCADE',
	})
	article!: Article;

	@Column()
	articleId!: number;
}
