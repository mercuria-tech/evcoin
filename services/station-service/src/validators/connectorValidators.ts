import Joi from 'joi';
import { ConnectorType, ConnectorStatus } from '@ev-charging/shared-types';

export const createConnectorSchema = Joi.object({
  stationId: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.uuid': 'Invalid station ID format',
      'any.required': 'Station ID is required'
    }),
    
  connectorNumber: Joi.number()
    .integer()
    .min(1)
    .max(99)
    .required()
    .messages({
      'number.min': 'Connector number must be at least 1',
      'number.max': 'Connector number cannot exceed 99',
      'any.required': 'Connector number is required'
    }),
    
  connectorType: Joi.array()
    .items(Joi.string().valid(...Object.values(ConnectorType)))
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one connector type must be specified',
      'any.required': 'Connector type is required'
    }),
    
  powerKw: Joi.number()
    .positive()
    .max(350)
    .required()
    .messages({
      'number.positive': 'Power must be positive',
      'number.max': 'Power cannot exceed 350 kW',
      'any.required': 'Power rating is required'
    }),
    
  pricing: Joi.object({
    perKwh: Joi.number()
      .min(0)
      .max(10)
      .optional()
      .messages({
        'number.min': 'Price per kWh cannot be negative',
        'number.max': 'Price per kWh cannot exceed $10'
      }),
      
    perMinute: Joi.number()
      .min(0)
      .max(5)
      .optional()
      .messages({
        'number.min': 'Price per minute cannot be negative',
        'number.max': 'Price per minute cannot exceed $5'
      })
  }).optional()
});

export const updateConnectorSchema = Joi.object({
  connectorNumber: Joi.number()
    .integer()
    .min(1)
    .max(99)
    .optional(),
    
  connectorType: Joi.array()
    .items(Joi.string().valid(...Object.values(ConnectorType)))
    .min(1)
    .optional(),
    
  powerKw: Joi.number()
    .positive()
    .max(350)
    .optional(),
    
  pricing: Joi.object({
    perKwh: Joi.number()
      .min(0)
      .max(10)
      .optional(),
      
    perMinute: Joi.number()
      .min(0)
      .max(5)
      .optional()
  }).optional()
});

export const updateConnectorStatusSchema = Joi.object({
  status: Joi.string()
    .valid(...Object.values(ConnectorStatus))
    .required()
    .messages({
      'any.only': 'Invalid connector status',
      'any.required': 'Connector status is required'
    }),
    
  errorCode: Joi.string()
    .max(50)
    .optional()
    .messages({
      'string.max': 'Error code cannot exceed 50 characters'
    }),
    
  errorMessage: Joi.string()
    .max(500)
    .optional()
    .messages({
      'string.max': 'Error message cannot exceed 500 characters'
    })
});

export const updatePricingSchema = Joi.object({
  pricingPerKwh: Joi.number()
    .min(0)
    .max(10)
    .required()
    .messages({
      'number.min': 'Price per kWh cannot be negative',
      'number.max': 'Price per kWh cannot exceed $10',
      'any.required': 'Price per kWh is required'
    }),
    
  pricingPerMinute: Joi.number()
    .min(0)
    .max(5)
    .optional()
    .messages({
      'number.min': 'Price per minute cannot be negative',
      'number.max': 'Price per minute cannot exceed $5'
    }),
    
  effectiveFrom: Joi.date()
    .min('now')
    .optional()
    .messages({
      'date.min': 'Effective date cannot be in the past'
    })
});
