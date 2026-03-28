import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../../types/common.types';

const searchSchema: Joi.ObjectSchema = Joi.object({
  q: Joi.string().required().min(1).max(100),
  limit: Joi.number().min(1).max(50).default(20),
  offset: Joi.number().min(0).max(1000).default(0),
});

const getTrackSchema: Joi.ObjectSchema = Joi.object({
  id: Joi.string().required(),
});

const validate = (schema: Joi.ObjectSchema, property: 'body' | 'query' | 'params' = 'query') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req[property], { abortEarly: false });
    if (error) {
      res.status(422).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map((d) => d.message),
      } as ApiResponse);
      return;
    }
    // Update req with validated/default values
    req[property] = value;
    next();
  };
};

export const searchValidator = validate(searchSchema, 'query');
export const getTrackValidator = validate(getTrackSchema, 'params');
