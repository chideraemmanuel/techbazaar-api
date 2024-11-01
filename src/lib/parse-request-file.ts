import { Request, Response, NextFunction } from 'express';
import { upload } from '../config/multer';
import HttpError from './http-error';

const parseRequestFile = (fieldName: string) => {
  return (request: Request, response: Response, next: NextFunction) => {
    upload.single(fieldName)(request, response, (error) => {
      if (error) {
        if (error.code === 'LIMIT_FILE_SIZE') {
          throw new HttpError('Max file size is 5MB.', 400);
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
          throw new HttpError('Too many files uploaded', 400);
        }
        if (error.code === 'LIMIT_UNEXPECTED_FILE') {
          throw new HttpError('Unexpected file field', 400);
        }

        next(error);
        return;
      }

      next();
    });
  };
};

export default parseRequestFile;
