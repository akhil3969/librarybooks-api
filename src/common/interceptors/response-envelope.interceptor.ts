import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map } from 'rxjs';
import type { RequestWithId } from '../middleware/request-id.middleware';
@Injectable()
export class ResponseEnvelopeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest<RequestWithId>();
    return next.handle().pipe(
      map((data: unknown) => ({
        success: true,
        requestId: request.requestId,
        ...(Array.isArray(data) ? { count: data.length } : {}),
        data,
      })),
    );
  }
}
