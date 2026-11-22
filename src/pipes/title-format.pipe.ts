import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
@Injectable()
export class TitleFormatPipe implements PipeTransform {
  transform(value: { title?: unknown }) {
    if (value.title === undefined) return value;
    if (typeof value.title !== 'string' || value.title.trim().length < 2) {
      throw new BadRequestException(
        'Title must have at least 2 characters after trimming',
      );
    }
    const title = value.title
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    return { ...value, title };
  }
}
