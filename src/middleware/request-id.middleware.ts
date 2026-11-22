import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';
export type RequestWithId = Request & { requestId: string };
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: RequestWithId, res: Response, next: NextFunction) {
    req.requestId = req.get('x-request-id') || randomUUID();
    res.setHeader('X-Request-Id', req.requestId);
    next();
  }
}
