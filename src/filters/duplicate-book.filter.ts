import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';

@Catch()
export class DuplicateBookFilter<T> implements ExceptionFilter {
  catch(exception: T, host: ArgumentsHost) {}
}
