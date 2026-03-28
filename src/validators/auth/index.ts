import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../../types/common.types';

const registerSchema: Joi.ObjectSchema = Joi.object({
  email: Joi.string().email().required(),
  username: Joi.string().min(3).max(30).alphanum().required(),
  password: Joi.string().min(8).max(128).required(),
  displayName: Joi.string().min(2).max(50).required(),
});

const loginSchema: Joi.ObjectSchema = Joi.object({
  email: Joi.string().email(),
  username: Joi.string().min(3).max(30).alphanum(),
  password: Joi.string().required(),
}).or('email', 'username');

const refreshTokenSchema: Joi.ObjectSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const data = { ...req.body, ...req.cookies };
    const { error } = schema.validate(data, { abortEarly: false });
    if (error) {
      res.status(422).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map((d) => d.message),
      } as ApiResponse);
      return;
    }
    next();
  };
};

export const registerValidator = validate(registerSchema);
export const loginValidator = validate(loginSchema);
export const refreshTokenValidator = validate(refreshTokenSchema);
