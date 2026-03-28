import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../../types/common.types';

const updateProfileSchema: Joi.ObjectSchema = Joi.object({
  displayName: Joi.string().min(2).max(50),
  avatarUrl: Joi.string().uri().allow(null, ''),
}).min(1);

export const updateProfileValidator = (req: Request, res: Response, next: NextFunction): void => {
  const { error } = updateProfileSchema.validate(req.body, { abortEarly: false });
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
