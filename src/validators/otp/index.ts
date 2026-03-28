import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../../types/common.types';

const requestOtpSchema = Joi.object({
  identifier: Joi.string().required(),
  type: Joi.string().valid('email', 'phone').required(),
});

const verifyOtpSchema = Joi.object({
  identifier: Joi.string().required(),
  code: Joi.string().length(6).required(),
});

const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      res.status(422).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map((d) => d.message),
      } as ApiResponse);
      return;
    }
    req.body = value;
    next();
  };
};

export const requestOtpValidator = validate(requestOtpSchema);
export const verifyOtpValidator = validate(verifyOtpSchema);
