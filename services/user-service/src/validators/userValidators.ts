import Joi from 'joi';

export const updateProfileSchema = Joi.object({
  firstName: Joi.string()
    .min(2)
    .max(50)
    .optional()
    .messages({
      'string.min': 'First name must be at least 2 characters long',
      'string.max': 'First name must be less than 50 characters'
    }),
    
  lastName: Joi.string()
    .min(2)
    .max(50)
    .optional()
    .messages({
      'string.min': 'Last name must be at least 2 characters long',
      'string.max': 'Last name must be less than 50 characters'
    }),
    
  phone: Joi.string()
    .pattern(/^\+[1-9]\d{1,14}$/)
    .optional()
    .messages({
      'string.pattern': 'Please provide a valid phone number with country code'
    })
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'any.required': 'Current password is required'
    }),
    
  newPassword: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.min': 'New password must be at least 8 characters long',
      'string.pattern': 'New password must contain at least one lowercase letter, one uppercase letter, one number, and one special character',
      'any.required': 'New password is required'
    }),
    
  confirmPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': 'Confirm password must match new password',
      'any.required': 'Confirm password is required'
    })
});

export const updatePreferencesSchema = Joi.object({
  language: Joi.string()
    .length(2)
    .optional(),
    
  currency: Joi.string()
    dash(3)
    .optional(),
    
  timezone: Joi.string()
    .optional(),
    
  notifications: Joi.object({
    email: Joi.boolean().optional(),
    push: Joi.boolean().optional(),
    sms: Joi.boolean().optional(),
    chargingUpdates: Joi.boolean().optional(),
    reservationReminders: Joi.boolean().optional(),
    paymentConfirmations: Joi.boolean().optional(),
    promotionalMessages: Joi.boolean().optional(),
    systemAnnouncements: Joi.boolean().optional()
  }).optional()
});
