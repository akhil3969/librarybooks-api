import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
@Injectable()
export class PublishedYearValidationPipe implements PipeTransform {
  transform(value: { publishedYear?: unknown }) {
    if (value.publishedYear === undefined) return value;
    const year = value.publishedYear;
    const currentYear = new Date().getFullYear();
    if (
      typeof year !== 'number' ||
      !Number.isInteger(year) ||
      year < 1450 ||
      year > currentYear
    ) {
      throw new BadRequestException(
        `publishedYear must be an integer between 1450 and ${currentYear}`,
      );
    }
    return value;
  }
}
