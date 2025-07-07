import { PartialType } from '@nestjs/mapped-types';
import { NewArticleDTO } from './new-article.dto';

export class UpdateArticleDTO extends PartialType(NewArticleDTO) {}
