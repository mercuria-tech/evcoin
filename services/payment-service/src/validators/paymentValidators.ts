import Joi from 'joi';
import { PaymentType, PaymentProvider, TransactionType } from '@ev-charging/shared-types';

export const cardDetailsSchema = Joi.object({
  number: Joi.string()
    .creditCard()
    .required()
    .messages({
      'string.creditCard': 'Invalid credit card number',
      'any.required': 'Card number is required'
    }),
    
  expMonth: Joi.number()
    .integer()
    .min(1)
    .max(12)
    .required()
    .messages({
      'number.min': 'Expiry month must be between 1 and 12',
      'number.max': 'Expiry month must be between 1 and 12',
      'any.required': 'Expiry month is required'
    }),
    
 ```typescript
  expYear: Joi.number()
    .integer()
    .min(new Date().getFullYear())
    .max(new Date().getFullYear() + 20)
    .required()
    .messages({
      'number.min': 'Expiry year cannot be in the past',
      'number.max': 'Expiry year cannot be more than 20 years in the future',
      'any.required': 'Expiry year is required'
    }),
    
  cvc: Joi.string()
    .pattern(/^\d{3,4}$/)
    .required()
    .messages({
      'string.pattern': 'CVC must be 3 or 4 digits',
      'any.required': 'CVC is required'
    }),
    
  name: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Cardholder name must be at least 2 characters',
      'string.max': 'Cardholder name cannot exceed 100 characters',
      'any.required': 'Cardholder name is required'
    })
});

export const billingAddressSchema = Joi.object({
  street: Joi.string()
    .min(1)
    .max(255)
    .required()
    .messages({
      'string.min': 'Street address is required',
      'string.max': 'Street address cannot exceed 255 characters',
      'any.required': 'Street address is required'
    }),
    
  city: Joi.string()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.min': 'City is required',
      'string.max': 'City cannot exceed 100 characters',
      'any.required': 'City is required'
    }),
    
  state: Joi.string()
    .min(1)
    .max(100)
    .optional()
    .messages({
      'string.min': 'State cannot be empty if provided',
      'string.max': 'State cannot exceed 100 characters'
    }),
    
  zip: Joi.string()
    .min(1)
    .max(20)
    .optional()
    .messages({
      'string.min': 'ZIP code cannot be empty if provided',
      'string.max': 'ZIP code cannot exceed 20 characters'
    }),
    
  country: Joi.string()
    .length(2)
    .pattern(/^[A-Z]{2}$/)
    .required()
    .messages({
      'string.length': 'Country code must be 2 characters',
      'string.pattern': 'Country code must be uppercase letters',
      'any.required': 'Country code is required'
    })
});

export const addPaymentMethodSchema = Joi.object({
  type: Joi.string()
    .valid(...Object.values(PaymentType))
    .required()
    .messages({
      'any.only': 'Invalid payment type',
      'any.required': 'Payment type is required'
    }),
    
  provider: Joi.string()
    .valid(...Object.values(PaymentProvider))
    .required()
    .messages({
      'any.only': 'Invalid payment provider',
      'any.required': 'Payment provider is required'
    }),
    
  card: Joi.when('type', {
    is: PaymentType.CARD,
    then: cardDetailsSchema.required(),
    otherwise: Joi.forbidden()
  }),
    
  walletId: Joi.when('type', {
    is: Joi.string().valid(PaymentType.WALLET, PaymentType.APPLE_PAY, PaymentType.GOOGLE_PAY, PaymentType.PAYPAL, PaymentType.LOCAL_WALLET),
    then: Joi.string().required(),
    otherwise: Joi.forbidden()
  }),
    
  billingAddress: billingAddressSchema.when('type', {
    is: PaymentType.CARD,
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
    
  setAsDefault: Joi.boolean()
    .optional()
    .default(false),
    
  providerData: Joi.object()
    .optional()
    .unknown(true)
});

export const createPaymentIntentSchema = Joi.object({
  amount: Joi.number()
    .positive()
    .precision(2)
    .max(100000)
    .required()
    .messages({
      'number.positive': 'Amount must be positive',
      'number.precision': 'Amount cannot have more than 2 decimal places',
      'number.max': 'Amount cannot exceed $100,000',
      'any.required': 'Amount is required'
    }),
    
  currency: Joi.string()
    .length(3)
    .pattern(/^[A-Z]{3}$/)
    .required()
    .messages({
      'string.length': 'Currency must be 3 characters',
      'string.pattern': 'Currency must be uppercase letters',
      'any.required': 'Currency is required'
    }),
    
  provider: Joi.string()
    .valid(...Object.values(PaymentProvider))
    .required()
    .messages({
      'any.only': 'Invalid payment provider',
      'any.required': 'Payment provider is required'
    }),
    
  description: Joi.string()
    .max(255)
    .optional()
    .messages({
      'string.max': 'Description cannot exceed 255 characters'
    }),
    
  metadata: Joi.object()
    .optional()
    .unknown(true)
});

export const processPaymentSchema = Joi.object({
  paymentMethodId: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.uuid': 'Invalid payment method ID format',
      'any.required': 'Payment method ID is required'
    }),
    
  amount: Joi.number()
    .positive()
    .precision(2)
    .max(100000)
    .required()
    .messages({
      'number.positive': 'Amount must be positive',
      'number.precision': 'Amount cannot have more than 2 decimal places',
      'number.max': 'Amount cannot exceed $100,000',
      'any.required': 'Amount is required'
    }),
    
  currency: Joi.string()
    .length(3)
    .pattern(/^[A-Z]{3}$/)
    .required()
    .messages({
      'string.length': 'Currency must be 3 characters',
      'string.pattern': 'Currency must be uppercase letters',
      'any.required': 'Currency is required'
    }),
    
  provider: Joi.string()
    .valid(...Object.values(PaymentProvider))
    .required()
    .messages({
      'any.only': 'Invalid payment provider',
      'any.required': 'Payment provider is required'
    }),
    
  sessionId: Joi.string()
    .uuid()
    .optional()
    .messages({
      'string.uuid': 'Invalid session ID format'
    }),
    
  reservationId: Joi.string()
    .uuid()
    .optional()
    .messages({
      'string.uuid': 'Invalid reservation ID format'
    }),
    
  metadata: Joi.object()
    .optional()
    .unknown(true)
});

export const estimateFeesSchema = Joi.object({
  amount: Joi.number()
    .positive()
    .required()
    .messages({
      'number.positive': 'Amount must be positive',
      'any.required': 'Amount is required'
    }),
    
  currency: Joi.string()
    .length(3)
    .pattern(/^[A-Z]{3}$/)
    .required()
    .messages({
      'string.length': 'Currency must be 3 characters',
      'string.pattern': 'Currency must be uppercase letters',
      'any.required': 'Currency is required'
    }),
    
  provider: Joi.string()
    .valid(...Object.values(PaymentProvider))
    .required()
    .messages({
      'any.only': 'Invalid payment provider',
      'any.required': 'Payment provider is required'
    }),
    
  region: Joi.string()
    .length(2)
    .pattern(/^[A-Z]{2}$/)
    .optional()
    .messages({
      'string.length': 'Region code must be 2 characters',
      'string.pattern': 'Region code must be uppercase letters'
    })
});

export const walletTopUpSchema = Joi.object({
  amount: Joi.number()
    .positive()
    .precision(2)
    .max(5000)
    .required()
    .messages({
      'number.positive': 'Amount must be positive',
      'number.precision': 'Amount cannot have more than 2 decimal places',
      'number.max': 'Amount cannot exceed $5,000',
      'any.required': 'Amount is required'
    }),
    
  currency: Joi.string()
    .length(3)
    .pattern(/^[A-Z]{3}$/)
    .required()
    .messages({
      'string.length': 'Currency must be 3 characters',
      'string.pattern': 'Currency must be uppercase letters',
      'any.required': 'Currency is required'
    }),
    
  paymentMethodId: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.uuid': 'Invalid payment method ID format',
      'any.required': 'Payment method ID is required'
    })
});

export const subscriptionCreateSchema = Joi.object({
  planId: Joi.string()
    .required()
    .messages({
      'any.required': 'Plan ID is required'
    }),
    
  paymentMethodId: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.uuid': 'Invalid payment method ID format',
      'any.required': 'Payment method ID is required'
    }),
    
  billingCycle: Joi.string()
    .valid('monthly', 'yearly')
    .required()
    .messages({
      'any.only': 'Billing cycle must be monthly or yearly',
      'any.required': 'Billing cycle is required'
    })
});

export const bankTransferSchema = Joi.object({
  beneficiary: Joi.object({
    name: Joi.string()
      .min(2)
      .max(100)
      .required()
      .messages({
        'string.min': 'Beneficiary name must be at least 2 characters',
        'string.max': 'Beneficiary name cannot exceed 100 characters',
        'any.required': 'Beneficiary name is required'
      }),
      
    accountNumber: Joi.string()
      .pattern(/^\d{10,20}$/)
      .required()
      .messages({
        'string.pattern': 'Account number must be 10-20 digits',
        'any.required': 'Account number is required'
      }),
      
    bankCode: Joi.string()
      .required()
      .messages({
        'any.required': 'Bank code is required'
      }),
      
    routingNumber: Joi.string()
      .optional()
  }).required(),
    
  amount: Joi.number()
    .positive()
    .precision(2)
    .max(50000)
    .required()
    .messages({
      'number.positive': 'Amount must be positive',
      'number.precision': 'Amount cannot have more than 2 decimal places',
      'number.max': 'Amount cannot exceed $50,000',
      'any.required': 'Amount is required'
    }),
    
  currency: Joi.string()
    .length(3)
    .pattern(/^[A-Z]{3}$/)
    .required()
    .messages({
      'string.length': 'Currency must be 3 characters',
      'string.pattern': 'Currency must be uppercase letters',
      'any.required': 'Currency is required'
    }),
    
  reference: Joi.string()
    .max(50)
    .optional()
    .messages({
      'string.max': 'Reference cannot exceed 50 characters'
    })
});
