import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseFilters,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { LibrarianGuard } from '../common/guards/librarian.guard';
import { DuplicateBookFilter } from '../common/filters/duplicate-book.filter';
import { TitleFormatPipe } from '../common/pipes/title-format.pipe';
import { PublishedYearValidationPipe } from '../common/pipes/published-year-validation.pipe';
import { ResponseEnvelopeInterceptor } from '../common/interceptors/response-envelope.interceptor';
const validateBody = new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
});
@Controller('books')
@UseInterceptors(ResponseEnvelopeInterceptor)
export class BooksController {
  constructor(private readonly books: BooksService) {}
  @Get()
  findAll() {
    return this.books.findAll();
  }
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.books.findOne(id);
  }
  @Post()
  @UseGuards(LibrarianGuard)
  @UseFilters(DuplicateBookFilter)
  create(
    @Body(validateBody, TitleFormatPipe, PublishedYearValidationPipe)
    dto: CreateBookDto,
  ) {
    return this.books.create(dto);
  }
  @Patch(':id')
  @UseGuards(LibrarianGuard)
  @UseFilters(DuplicateBookFilter)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(validateBody, TitleFormatPipe, PublishedYearValidationPipe)
    dto: UpdateBookDto,
  ) {
    return this.books.update(id, dto);
  }
  @Delete(':id')
  @UseGuards(LibrarianGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.books.remove(id);
  }
}
