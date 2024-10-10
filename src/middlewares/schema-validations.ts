import { NextFunction, Request, Response } from 'express';
import HttpError from '../lib/http-error';
import { ZodSchema } from 'zod';

export const validateRequestBodySchema = (schema: ZodSchema) => {
  return (request: Request, response: Response, next: NextFunction) => {
    const { success, error } = schema.safeParse(request.body);

    if (!success) {
      // const errors = error.flatten().fieldErrors
      // return response.status(400).json({ errors: errors })
      console.log('error.format()._errors', error.format()._errors);

      throw new HttpError(error.format()._errors[0], 400);
    }

    next();
  };
};

export const validateRequestQuerySchema = (schema: ZodSchema) => {
  return (request: Request, response: Response, next: NextFunction) => {
    const { success, error } = schema.safeParse(request.query);

    if (!success) {
      // const errors = error.flatten().fieldErrors
      // return response.status(400).json({ errors: errors })
      console.log('error.format()._errors', error.format()._errors);

      throw new HttpError(error.format()._errors[0], 400);
    }

    next();
  };
};
