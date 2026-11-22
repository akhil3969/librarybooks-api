import { ConflictException, NotFoundException } from '@nestjs/common';
import { QueryFailedError, Repository } from 'typeorm';
import { BooksService } from './books.service';
import { BookEntity } from './entities/book.entity';
describe('BooksService', () => {
  const book = {
    id: 1,
    title: 'The Hobbit',
    genre: 'fiction' as const,
    publishedYear: 1937,
  };
  let service: BooksService;
  let repo: {
    findOneBy: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    merge: jest.Mock;
    delete: jest.Mock;
  };
  beforeEach(() => {
    repo = {
      findOneBy: jest.fn(),
      create: jest.fn((v) => v),
      save: jest.fn((v) => v),
      merge: jest.fn((a, b) => ({ ...a, ...b })),
      delete: jest.fn(),
    };
    service = new BooksService(repo as unknown as Repository<BookEntity>);
  });
  it('returns 404 for missing books', async () => {
    repo.findOneBy.mockResolvedValue(null);
    await expect(service.findOne(99)).rejects.toBeInstanceOf(NotFoundException);
  });
  it('rejects duplicate titles before saving', async () => {
    repo.findOneBy.mockResolvedValue(book);
    await expect(service.create(book)).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(repo.save).not.toHaveBeenCalled();
  });
  it('allows keeping the same title on update', async () => {
    repo.findOneBy.mockResolvedValue(book);
    await expect(service.update(1, { title: book.title })).resolves.toEqual(
      book,
    );
  });
  it('translates a database unique violation into a conflict', async () => {
    repo.findOneBy.mockResolvedValue(null);
    repo.save.mockRejectedValue(
      new QueryFailedError(
        'INSERT',
        [],
        Object.assign(new Error('duplicate'), { code: '23505' }),
      ),
    );
    await expect(service.create(book)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });
  it('does not hide other database errors', async () => {
    repo.findOneBy.mockResolvedValue(null);
    repo.save.mockRejectedValue(new Error('connection lost'));
    await expect(service.create(book)).rejects.toThrow('connection lost');
  });
});
