import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  
} from '@nestjs/common';
import type { Request } from 'express';
@Injectable()
export class LibrarianGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    if (request.headers['x-role'] !== 'librarian') {
      throw new ForbiddenException('Only librarians can modify books');
      
    }
    return true;
  }
}
