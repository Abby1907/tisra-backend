import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

const createPlaylistSchema: Joi.ObjectSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
});

const updatePlaylistSchema: Joi.ObjectSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
});

const addTrackSchema: Joi.ObjectSchema = Joi.object({
  spotifyTrackId: Joi.string().required(),
  trackName: Joi.string().required(),
  artistName: Joi.string().required(),
  albumArt: Joi.string().allow(null, ''),
  durationMs: Joi.number().integer().positive().required(),
});

export const createPlaylistValidator = (req: Request, res: Response, next: NextFunction): void => {
  const { error } = createPlaylistSchema.validate(req.body, { abortEarly: false });
  if (error) {
    res.status(422).json({ success: false, errors: error.details.map((d) => d.message) });
    return;
  }
  next();
};

export const updatePlaylistValidator = (req: Request, res: Response, next: NextFunction): void => {
  const { error } = updatePlaylistSchema.validate(req.body, { abortEarly: false });
  if (error) {
    res.status(422).json({ success: false, errors: error.details.map((d) => d.message) });
    return;
  }
  next();
};

export const addTrackValidator = (req: Request, res: Response, next: NextFunction): void => {
  const { error } = addTrackSchema.validate(req.body, { abortEarly: false });
  if (error) {
    res.status(422).json({ success: false, errors: error.details.map((d) => d.message) });
    return;
  }
  next();
};
