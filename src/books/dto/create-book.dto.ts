import { IsIn, IsInt, IsString } from 'class-validator';
import { BOOK_GENRES } from '../entities/book.entity';
import type { BookGenre } from '../entities/book.entity';
export class CreateBookDto {
  @IsString() title: string;
  @IsIn(BOOK_GENRES) genre: BookGenre;
  @IsInt() publishedYear: number;
}
