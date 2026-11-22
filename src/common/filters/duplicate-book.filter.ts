import {
  ArgumentsHost,
  Catch,
  ConflictException,
  ExceptionFilter,
  
} from '@nestjs/common';
import type { Request, Response } from 'express';
@Catch(ConflictException)
export class DuplicateBookFilter implements ExceptionFilter<ConflictException> {
    catch(_exception: ConflictException, host: ArgumentsHost) {
    const http = host.switchToHttp();
    http.getResponse<Response>().status(409).json({
      error: 'Duplicate Book',
      statusCode: 409,
      timestamp: new Date().toISOString(),
      path: http.getRequest<Request>().originalUrl,
      
    });
  }
}
