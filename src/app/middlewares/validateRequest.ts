import { ZodObject } from 'zod';
import catchAsync from '../../shared/catchAsync';

export const validateRequest = (schema: ZodObject) => {
  return catchAsync(async (req, res, next) => {
    await schema.parseAsync({
        body: req.body,
        // query: req.query,
        // params: req.params,
        // cookies: req.cookies,
      });
    next();
  });
};