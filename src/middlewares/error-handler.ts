import { NextFunction, Request, Response } from 'express';
import createError from 'http-errors';
import HttpError from 'lib/http-error';

export const notFound = (
  request: Request,
  _response: Response,
  next: NextFunction
) => {
  next(createError(404, `Not Found - ${request.originalUrl}`));
};

export const errorHandler = (
  error: HttpError,
  _request: Request,
  response: Response,
  _next: NextFunction
) => {
  const statusCode = error.statusCode || 500;

  response.status(statusCode);

  response.json({
    error: error.message || 'Something went wrong',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
};
