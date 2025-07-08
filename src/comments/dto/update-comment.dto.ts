import { PartialType } from '@nestjs/mapped-types';
import { CreateArticleDTO } from 'src/articles/dto/create-article.dto';

export class UpdateArticleDTO extends PartialType(CreateArticleDTO) {}
