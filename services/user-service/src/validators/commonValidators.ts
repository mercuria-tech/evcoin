import Joi from 'joi';

export const uuidSchema = Joi.object({
  id: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.uuid': 'Invalid ID format',
      'any.required': 'ID is required'
    })
});

export const paginationSchema = Joi.object({
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .optional()
    .default(20)
      
messages({
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100'
    }),
    
  offset: Joi.number()
    .integer()
    .min(0)
    .optional()
    .default(0)
    .messages({
      'number.min': 'Offset must not be negative'
    }),
    
  page: Joi.number()
    .integer()
    .min(1)
    .optional()
    .messages({
      'number.min': 'Page must be at least 1'
    })
});

export const dateRangeSchema = Joi.object({
  startDate: Joi.date()
    .optional(),
    
  endDate: Joi.date()
    .min(Joi.ref('startDate'))
    .optional()
});

export const sortSchema = Joi.object({
  sortBy: Joi.string()
    .optional(),
    
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .optional()
    .default('desc')
});
