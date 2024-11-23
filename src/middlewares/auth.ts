import { NextFunction, Request, Response } from 'express';
import HttpError from '../lib/http-error';
import Session from '../models/session';
import User, { UserSchemaInterface } from '../models/user';

export interface AuthenticatedRequest extends Request {
  user: UserSchemaInterface;
}

export interface AuthorizedRequest extends Request {
  user: UserSchemaInterface;
}

export const authenticateRequest = async (
  request: AuthenticatedRequest,
  _response: Response,
  next: NextFunction
) => {
  try {
    // const { session_id } = request.cookies;
    const session_id =
      request.headers.authorization &&
      request.headers.authorization.startsWith('Bearer')
        ? request.headers.authorization.split(' ')[1]
        : null;

    if (!session_id) {
      throw new HttpError('Unauthorized access', 401);
    }

    const session = await Session.findOne({ session_id });

    if (!session) {
      throw new HttpError('Unauthorized access', 401);
    }

    const user = await User.findById(session.user);

    if (!user) {
      throw new HttpError('Unauthorized access', 401);
    }

    if (user && user.disabled) {
      throw new HttpError('Unauthorized access', 401);
    }

    request.user = user;

    next();
  } catch (error: any) {
    next(error);
  }
};

// ! should be used after `authenticateRequest`
export const verifyRequest = async (
  request: AuthenticatedRequest,
  _response: Response,
  next: NextFunction
) => {
  try {
    const user = request.user;

    if (!user) {
      throw new HttpError('Unauthorized access', 401);
    }

    if (user && !user.email_verified) {
      throw new HttpError('Unauthorized access', 401);
    }

    next();
  } catch (error: any) {
    next(error);
  }
};

export const authorizeRequest = async (
  request: AuthorizedRequest,
  _response: Response,
  next: NextFunction
) => {
  try {
    // const { session_id } = request.cookies;
    const session_id =
      request.headers.authorization &&
      request.headers.authorization.startsWith('Bearer')
        ? request.headers.authorization.split(' ')[1]
        : null;

    if (!session_id) {
      throw new HttpError('Unauthorized access - No Session ID', 401);
    }

    const session = await Session.findOne({ session_id });

    if (!session) {
      throw new HttpError('Unauthorized access - No Session on Database', 401);
    }

    const user = await User.findById(session.user);

    if (!user) {
      throw new HttpError(
        'Unauthorized access - User Not Found on Database',
        401
      );
    }

    if (user && !user.email_verified) {
      throw new HttpError('Unauthorized access - Email Not Verified', 401);
    }

    if (user && user.disabled) {
      throw new HttpError('Unauthorized access - User Disabled', 401);
    }

    if (user && user.role !== 'admin') {
      throw new HttpError('Unauthorized access - User Not Admin', 403);
    }

    request.user = user;

    next();
  } catch (error: any) {
    next(error);
  }
};

export const blockRequestIfActiveSession = async (
  request: Request,
  _response: Response,
  next: NextFunction
) => {
  try {
    // const { session_id } = request.cookies;
    const session_id =
      request.headers.authorization &&
      request.headers.authorization.startsWith('Bearer')
        ? request.headers.authorization.split(' ')[1]
        : null;

    if (session_id) {
      const session = await Session.findOne({ session_id });

      if (session) {
        const user = await User.findById(session.user);

        if (user) {
          throw new HttpError(
            'An active session was found. Logout to access this endpoint.',
            400
          );
        }
      }
    }

    next();
  } catch (error: any) {
    next(error);
  }
};
