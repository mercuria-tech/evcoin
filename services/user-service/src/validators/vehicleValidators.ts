import Joi from 'joi';
import { ConnectorType } from '@ev-charging/shared-types';

export const createVehicleSchema = Joi.object({
  make: Joi.string()
    .min(1)
    .max(50)
    .required()
    .messages({
      'string.min': 'Vehicle make is required',
      'string.max': 'Vehicle make must be less than 50 characters',
      'any.required': 'Vehicle make is required'
    }),
    
  model: Joi.string()
    .min(1)
    .max(50)
    .required()
    .messages({
      'string.min': 'Vehicle model is required',
      'string.max': 'Vehicle model must be less than 50 characters',
      'any.required': 'Vehicle model is required'
    }),
    
  year: Joi.number()
    .integer()
    .min(1900)
    .max(new Date().getFullYear() + 1)
    .required()
    .messages({
      'number.min': 'Vehicle year must be after 1900',
      'number.max': 'Vehicle year cannot be in the future',
      'any.required': 'Vehicle year is required'
    }),
    
  vin: Joi.string()
    .length(17)
    .pattern(/^[A-HJ-NPR-Z0-9]{17}$/)
    .optional()
    .messages({
      'string.length': 'VIN must be exactly 17 characters',
      'string.pattern': 'VIN must contain only valid characters (excluding I, O, Q)'
    }),
    
  batteryCapacityKwh: Joi.number()
    .positive()
    .max(200)
    .optional()
    .messages({
      'number.positive': 'Battery capacity must be positive',
      'number.max': 'Battery capacity cannot exceed 200 kWh'
    }),
    
  connectorTypes: Joi.array()
    .items(Joi.string().valid(...Object.values(ConnectorType)))
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one connector type must be specified',
      'any.required': 'Connector types are required'
    }),
    
  isDefault: Joi.boolean()
    .optional()
    .default(false)
});

export const updateVehicleSchema = Joi.object({
  make: Joi.string()
    .min(1)
    .max(50)
    .optional(),
    
  model: Joi.string()
    .min(1)
    .max(50)
    .optional(),
    
  year: Joi.number()
    .integer()
    .min(1900)
    .max(new Date().getFullYear() + 1)
    .optional(),
    
  vin: Joi.string()
    .length(17)
    .pattern(/^[A-HJ-NPR-Z0-9]{17}$/)
    .optional(),
    
  batteryCapacityKwh: Joi.number()
    .positive()
    .max(200)
    .optional(),
    
  connectorTypes: Joi.array()
    .items(Joi.string().valid(...Object.values(ConnectorType)))
    .min(1)
    .optional(),
    
  isDefault: Joi.boolean()
    .optional()
});
