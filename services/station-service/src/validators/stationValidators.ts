import Joi from 'joi';
import { ConnectorType, Amenity } from '@ev-charging/shared-types';

export const stationSearchSchema = Joi.object({
  latitude: Joi.number()
    .min(-90)
    .max(90)
    .required()
    .messages({
      'number.min': 'Latitude must be between -90 and 90',
      'number.max': 'Latitude must be between -90 and 90',
      'any.required': 'Latitude is required'
    }),
    
  longitude: Joi.number()
    .min(-180)
    .max(180)
    .required()
    .messages({
      'number.min': 'Longitude must be between -180 and 180',
      'number.max': 'Longitude must be between -180 and 180',
      'any.required': 'Longitude is required'
    }),
    
  radius: Joi.number()
    .min(0.1)
    .max(100)
    .optional()
    .default(5)
    .messages({
      'number.min': 'Radius must be at least 0.1 km',
      'number.max': 'Radius cannot exceed 100 km'
    }),
    
  connectorTypes: Joi.array()
    .items(Joi.string().valid(...Object.values(ConnectorType)))
    .optional()
    .messages({
      'array.base': 'Connector types must be an array',
      'any.only': 'Invalid connector type specified'
    }),
    
  powerMin: Joi.number()
    .min(0)
    .max(350)
    .optional()
    .messages({
      'number.min': 'Power minimum cannot be negative',
      'number.max': 'Power minimum cannot exceed 350 kW'
    }),
    
  availableOnly: Joi.boolean()
    .optional()
    .default(false),
    
  amenities: Joi.array()
    .items(Joi.string().valid(...Object.values(Amenity)))
    .optional()
    .messages({
      'array.base': 'Amenities must be an array',
      'any.only': 'Invalid amenity specified'
    }),
    
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .optional()
    .default(20)
    .messages({
      'number.min': 'Requested more than the maximum limit',
      'number.max': 'Requested more than the maximum limit'
    }),
    
  offset: Joi.number()
    .integer()
    .min(0)
    .optional()
    .default(0)
    .messages({
      'number.min': 'Offset must not be negative'
    })
});

export const updateStationSchema = Joi.object({
  name: Joi.string()
    .min(1)
    .max(255)
    .optional()
    .messages({
      'string.min': 'Station name must be at least 1 character',
      'string.max': 'Station name cannot exceed 255 characters'
    }),
    
  description: Joi.string()
    .max(1000)
    .optional()
    .messages({
      'string.max': 'Description cannot exceed 1000 characters'
    }),
    
  amenities: Joi.array()
    .items(Joi.string().valid(...Object.values(Amenity)))
    .optional()
    .messages({
      'array.base': 'Amenities must be an array',
      'any.only': 'Invalid amenity specified'
    }),
    
  operatingHours: Joi.object({
    monday: Joi.string().optional(),
    tuesday: Joi.string().optional(),
    wednesday: Joi.string().optional(),
    thursday: Joi.string().optional(),
    friday: Joi.string().optional(),
    saturday: Joi.string().optional(),
    sunday: Joi.string().optional()
  }).optional(),
  
  contact: Joi.object({
    phone: Joi.string().optional(),
    email: Joi.string().email().optional()
  }).optional(),
  
  status: Joi.enum(['active', 'maintenance', 'inactive'])
    .optional()
});

export const setMaintenanceSchema = Joi.object({
  maintenanceMode: Joi.boolean()
    .required()
    .messages({
      'any.required': 'Maintenance mode flag is required'
    }),
  
  reason: Joi.string()
    .max(500)
    .optional()
    .messages({
      'string.max': 'Reason cannot exceed 500 characters'
    }),
  
  estimatedDuration: Joi.string()
    .optional()
});
