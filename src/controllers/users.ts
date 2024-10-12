import { NextFunction, Request, Response } from 'express';
import { AuthenticatedRequest, AuthorizedRequest } from '../middlewares/auth';
import HttpError from '../lib/http-error';
import validateSchema from '../lib/validate-schema';
import { updateCurrentUserSchema } from '../schemas/user';
import z from 'zod';
import Cart from '../models/cart';

export const getAllUsers = async (
  request: AuthorizedRequest,
  response: Response,
  next: NextFunction
) => {
  try {
    response.json({ message: 'Get all users!' });
  } catch (error: any) {
    next(error);
  }
};

export const getCurrentUser = async (
  request: AuthenticatedRequest,
  response: Response,
  next: NextFunction
) => {
  try {
    const user = request.user;
    response.json(user);
  } catch (error: any) {
    next(error);
  }
};

export const updateCurrentUser = async (
  request: AuthenticatedRequest,
  response: Response,
  next: NextFunction
) => {
  try {
    const user = request.user;

    if (!user) {
      // unlikely to be called, but in case
      throw new HttpError('Unauthorized access', 401);
    }

    const data = validateSchema<z.infer<typeof updateCurrentUserSchema>>(
      request.body,
      updateCurrentUserSchema
    );

    if (Object.keys(data).length === 0) {
      throw new HttpError('No field to be updated was supplied', 400);
    }

    const { first_name, last_name, password } = data;

    if (first_name) {
      // ? throw error if new first_name is the same as previous first_name..?
      user.first_name = first_name;
    }

    if (last_name) {
      // ? throw error if new last_name is the same as previous last_name..?
      user.last_name = last_name;
    }

    if (password) {
      // ? throw error if new password is the same as previous password..?
      user.password = password;
    }

    const updated_user = await user.save();

    response.json({
      message: 'User profile updated successfully',
      data: updated_user,
    });
  } catch (error: any) {
    next(error);
  }
};
