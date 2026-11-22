import { BooksController } from './books.controller';
import { BooksService } from './books.service';
describe('BooksController', () => {
  it('delegates reads to the service', async () => {
    const findAll = jest.fn().mockResolvedValue([]);
    const controller = new BooksController({
      findAll,
    } as unknown as BooksService);
    await controller.findAll();
    expect(findAll).toHaveBeenCalledTimes(1);
  });
});
