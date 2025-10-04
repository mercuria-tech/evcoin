import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  const requestId = generateRequestId();
  
  // Add request ID to request object for use in other middleware
  req.headers['x-request-id'] = requestId;
  req.headers['x-request-id'] = requestId;

  // Log request
  logger.info({
    type: 'request',
    requestId,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    contentLength: req.get('Content-Length'),
  });

  // Override the end method to capture response information
  const originalEnd = res.end;
  res.end = function(chunk?: any) {
    const duration = Date.now() - startTime;
    
    logger.info({
      type: 'response',
      requestId,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('Content-Length'),
    });

    originalEnd.call(this, chunk);
  };

  next();
};

const generateRequestId = (): string => string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}
