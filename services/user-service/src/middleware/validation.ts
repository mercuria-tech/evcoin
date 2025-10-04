import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { CustomError } from './errorHandler';

export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body, { 
      abortEarly: false,
      stripUnknown: true,
      allowUnknown: false
    });

    if (error) {
      const errorMessages = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      throw new CustomError('Validation failed', 400, {
        validationErrors: errorMessages,
        requestId: req.get('X-Request-ID') || 'unknown'
      });
    }

    // Replace req.body with validated and sanitized data
    const { value } = schema.validate(req.body, { 
      stripUnknown: true,
      allowUnknown: false
    });
    req.body = value;

    next();
  };
};

export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response,(next: NextFunction): void => {
    const { error } = schema.validate(req.query, { 
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessages = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      throw new CustomError('Validation failed', 400, {
        validationErrors: errorMessages,
        requestId: req.get('X-Request-ID') || 'unknown'
      });
    }

    next();
  };
};

export const validateParams = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.params, { 
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessages = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      throw new CustomError('Validation failed', 400, {
        validationErrors: errorMessages,
        requestId: req.get('X-Request-ID') || 'unknown'
      });
    }

    next();
  };
};
