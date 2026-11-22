import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { BooksModule } from '../src/books/books.module';
import { BookEntity } from '../src/books/entities/book.entity';

type BookRow = Pick<BookEntity, 'id' | 'title' | 'genre' | 'publishedYear'>;

// Exercises the real HTTP controller, service, middleware, guards, pipes,
// interceptor and filter. Only PostgreSQL is replaced for this fast suite.
describe('Library API request lifecycle', () => {
  let app: INestApplication;
  let rows: BookRow[];
  let nextId: number;
  beforeAll(async () => {
    const repo = {
      find: async () => rows,
      findOneBy: async (where: Partial<BookRow>) =>
        rows.find((b) =>
          Object.entries(where).every(
            ([key, value]) => b[key as keyof BookRow] === value,
          ),
        ) ?? null,
      create: (v: BookRow) => ({ ...v }),
      merge: (a: BookRow, b: Partial<BookRow>) => ({ ...a, ...b }),
      save: async (v: BookRow) => {
        const saved = { ...v, id: v.id ?? nextId++ };
        rows = [...rows.filter((b) => b.id !== saved.id), saved];
        return saved;
      },
      delete: async (id: number) => {
        rows = rows.filter((b) => b.id !== id);
      },
    };
    const module = await Test.createTestingModule({ imports: [BooksModule] })
      .overrideProvider(getRepositoryToken(BookEntity))
      .useValue(repo)
      .compile();
    app = module.createNestApplication();
    await app.init();
  });
  beforeEach(() => {
    rows = [];
    nextId = 1;
  });
  afterAll(async () => {
    await app.close();
  });
  const payload = {
    title: '  the HOBBIT  ',
    genre: 'fiction',
    publishedYear: 1937,
  };
  const create = (body = payload) =>
    request(app.getHttpServer())
      .post('/books')
      .set('x-role', 'librarian')
      .send(body);
  it('lists books with count and reuses the request ID', async () => {
    const res = await request(app.getHttpServer())
      .get('/books')
      .set('x-request-id', 'demo-123')
      .expect(200);
    expect(res.headers['x-request-id']).toBe('demo-123');
    expect(res.body).toEqual({
      success: true,
      requestId: 'demo-123',
      count: 0,
      data: [],
    });
  });
  it('creates, reads, updates, and deletes a book', async () => {
    const created = await create().expect(201);
    expect(created.body.data).toEqual({
      id: 1,
      title: 'The Hobbit',
      genre: 'fiction',
      publishedYear: 1937,
    });
    expect(created.body.requestId).toMatch(/^[0-9a-f-]{36}$/);
    expect(created.body).not.toHaveProperty('count');
    await request(app.getHttpServer()).get('/books/1').expect(200);
    const updated = await request(app.getHttpServer())
      .patch('/books/1')
      .set('x-role', 'librarian')
      .send({ genre: 'history' })
      .expect(200);
    expect(updated.body.data.title).toBe('The Hobbit');
    expect(updated.body.data.genre).toBe('history');
    await request(app.getHttpServer())
      .delete('/books/1')
      .set('x-role', 'librarian')
      .expect(200);
    await request(app.getHttpServer()).get('/books/1').expect(404);
  });
  it.each(['post', 'patch', 'delete'] as const)(
    'protects %s without the librarian header',
    async (method) => {
      const path = method === 'post' ? '/books' : '/books/1';
      const res = await request(app.getHttpServer())
        [method](path)
        .send(payload)
        .expect(403);
      expect(res.headers['x-request-id']).toBeDefined();
      await request(app.getHttpServer())
        [method](path)
        .set('x-role', 'student')
        .send(payload)
        .expect(403);
    },
  );
  it.each([
    { title: ' a ' },
    { title: null },
    { genre: 'fantasy' },
    { publishedYear: 1449 },
    { publishedYear: new Date().getFullYear() + 1 },
    { publishedYear: 2000.5 },
    { publishedYear: '2000' },
    { publishedYear: null },
    { extra: true },
  ])('rejects invalid create and patch input: %j', async (invalid) => {
    await create({ ...payload, ...invalid } as typeof payload).expect(400);
    await request(app.getHttpServer())
      .patch('/books/1')
      .set('x-role', 'librarian')
      .send(invalid)
      .expect(400);
  });
  it('requires all fields for create', async () => {
    await request(app.getHttpServer())
      .post('/books')
      .set('x-role', 'librarian')
      .send({})
      .expect(400);
  });
  it('accepts boundary years', async () => {
    await create({ ...payload, publishedYear: 1450 }).expect(201);
    await create({
      ...payload,
      title: 'Another Book',
      publishedYear: new Date().getFullYear(),
    }).expect(201);
  });
  it('formats duplicate conflicts on both create and update', async () => {
    await create().expect(201);
    const duplicate = await create({ ...payload, title: 'THE HOBBIT' }).expect(
      409,
    );
    expect(duplicate.body).toEqual({
      error: 'Duplicate Book',
      statusCode: 409,
      timestamp: expect.any(String),
      path: '/books',
    });
    expect(Number.isNaN(Date.parse(duplicate.body.timestamp))).toBe(false);
    await create({ ...payload, title: 'Another Book' }).expect(201);
    await request(app.getHttpServer())
      .patch('/books/2')
      .set('x-role', 'librarian')
      .send({ title: 'the hobbit' })
      .expect(409);
    await request(app.getHttpServer())
      .patch('/books/1')
      .set('x-role', 'librarian')
      .send({ title: 'the hobbit' })
      .expect(200);
  });
  it('rejects nonnumeric IDs and missing books', async () => {
    await request(app.getHttpServer()).get('/books/abc').expect(400);
    await request(app.getHttpServer()).get('/books/999').expect(404);
    await request(app.getHttpServer())
      .patch('/books/999')
      .set('x-role', 'librarian')
      .send({})
      .expect(404);
    await request(app.getHttpServer())
      .delete('/books/999')
      .set('x-role', 'librarian')
      .expect(404);
  });
});
