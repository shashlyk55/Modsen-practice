import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	CreateDateColumn,
	UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Session {
	@PrimaryGeneratedColumn()
	id!: string;

	@Column({ unique: true })
	accessTokenHash!: string;

	@Column({ unique: true })
	refreshTokenHash!: string;

	@Column()
	userAgent!: string;

	@Column()
	ipAddress!: string;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;

	@Column()
	expiresAt!: Date;

	@ManyToOne(() => User, (user) => user.sessions, { onDelete: 'CASCADE' })
	user!: User;
}
