import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export class CustomError extends Error implements AppError {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { statusCode = 500, message } = err;

  logger.error({
    error: err.message,
    statusCode,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Don't expose internal error details in production
  const errorMessage = process.env.NODE_ENV === 'production' && statusCode === 500 
    ? 'Internal Server Error' 
    : message;

  res.status(statusCode).json({
    success: false,
    error: {
      code: getErrorCode(statusCode),
      message: errorMessage,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
      requestId: req.get('X-Request-ID') || 'unknown',
      timestamp: new Date().toISOString() 
    }
  });
};

const getErrorCode = (statusCode: number): string => {
  const codes: Record<number, string> = {
    400: 'BAD_REQUEST',
    401: 'UNAUTHORIZED',
    403: 'FORBIDDEN',
    404: 'NOT_FOUND',
    409: 'CONFLICT',
    422: 'UNPROCESSABLE_ENTITY',
    429: 'TOO_MANY_REQUESTS',
    500: 'INTERNAL_SERVER_ERROR',
    503: 'SERVICE_UNAVAILABLE'
  };
  
  return codes[statusCode] || 'UNKNOWN_ERROR';
};
