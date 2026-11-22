import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { BookEntity } from './entities/book.entity';
import { RequestIdMiddleware } from '../middleware/request-id.middleware';
import { LibrarianGuard } from '../guards/librarian.guard';
import { TitleFormatPipe } from '../pipes/title-format.pipe';
import { PublishedYearValidationPipe } from '../pipes/published-year-validation.pipe';
import { DuplicateBookFilter } from '../filters/duplicate-book.filter';
import { ResponseEnvelopeInterceptor } from '../common/interceptors/response-envelope.interceptor';
@Module({
  imports: [TypeOrmModule.forFeature([BookEntity])],
  controllers: [BooksController],
  providers: [
    BooksService,
    LibrarianGuard,
    TitleFormatPipe,
    PublishedYearValidationPipe,
    DuplicateBookFilter,
    ResponseEnvelopeInterceptor,
  ],
})
export class BooksModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes(BooksController);
  }
}
