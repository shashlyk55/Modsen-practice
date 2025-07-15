import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './entities/user.entity';
import { Article } from './entities/article.entity';
import { Comment } from './entities/comment.entity';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { Session } from './entities/session.entity';
import { ArticlesModule } from './articles/articles.module';
import { CommentsModule } from './comments/comments.module';
import { ReactionsModule } from './reactions/reactions.module';
import { Reaction } from './entities/reaction';
import { SessionsModule } from './sessions/sessions.module';
import { Tag } from './entities/tag.entity';
import { TagsModule } from './tags/tags.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: '.env',
		}),
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (config: ConfigService) => ({
				type: 'postgres',
				host: config.get<string>('DB_HOST'),
				port: config.get<number>('DB_PORT'),
				username: config.get<string>('DB_USERNAME'),
				password: config.get<string>('DB_PASSWORD'),
				database: config.get<string>('DB_NAME'),
				entities: [User, Article, Comment, Session, Reaction, Tag],
				synchronize: true,
			}),
		}),
		AuthModule,
		UsersModule,
		ArticlesModule,
		CommentsModule,
		ReactionsModule,
		SessionsModule,
		TagsModule,
	],
})
export class AppModule {}
