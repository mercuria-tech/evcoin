import Joi from 'joi';

export const uuidSchema = Joi.string().guid({ version: ['uuidv4'] });

export const passwordSchema = Joi.string()
  .min(8)
  .max(128)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).*$/)
  .message('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.');
