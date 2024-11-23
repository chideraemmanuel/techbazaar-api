import { Request, Response, NextFunction } from 'express';
import Session from '../models/session';

export const updateSession = async (
  request: Request,
  response: Response,
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
        await session.updateOne({
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours
        });
      }
    }

    next();
  } catch (error: any) {
    next(error);
  }
};
