import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { BookEntity } from './entities/book.entity';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(BookEntity)
    private readonly books: Repository<BookEntity>,
  ) {}
  findAll() {
    return this.books.find({ order: { id: 'ASC' } });
  }
  async findOne(id: number) {
    const book = await this.books.findOneBy({ id });
    if (!book) throw new NotFoundException(`Book #${id} not found`);
    return book;
  }
  async create(dto: CreateBookDto) {
    await this.checkDuplicate(dto.title);
    return this.save(this.books.create(dto));
  }
  async update(id: number, dto: UpdateBookDto) {
    const book = await this.findOne(id);
    if (dto.title !== undefined) await this.checkDuplicate(dto.title, id);
    return this.save(this.books.merge(book, dto));
  }
  async remove(id: number) {
    const book = await this.findOne(id);
    await this.books.delete(id);
    return book;
  }
  private async checkDuplicate(title: string, currentId?: number) {
    const existing = await this.books.findOneBy({ title });
    if (existing && existing.id !== currentId)
      throw new ConflictException('Book already exists');
  }
  private async save(book: BookEntity) {
    try {
      return await this.books.save(book);
    } catch (error) {
      // The unique constraint also protects simultaneous duplicate requests.
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string }).code === '23505'
      ) {
        throw new ConflictException('Book already exists');
      }
      throw error;
    }
  }
}
