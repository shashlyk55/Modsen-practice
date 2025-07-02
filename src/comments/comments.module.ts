import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';

@Module({
	controllers: [],
	providers: [CommentsService],
})
export class CommentsModule {}
