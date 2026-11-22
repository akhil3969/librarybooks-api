import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
export const BOOK_GENRES = ['fiction', 'science', 'history'] as const;
export type BookGenre = (typeof BOOK_GENRES)[number];
@Entity('books')
export class BookEntity {
  @PrimaryGeneratedColumn() id: number;
  @Column({ type: 'text', unique: true }) title: string;
  @Column({ type: 'enum', enum: [...BOOK_GENRES] }) genre: BookGenre;
  @Column({ type: 'integer' }) publishedYear: number;
}
