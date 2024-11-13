import { Request, Response, NextFunction } from 'express';
import Session from '../models/session';

export const updateSession = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const { session_id } = request.cookies;

    if (session_id) {
      const session = await Session.findOne({ session_id });

      if (session) {
        await session.updateOne({
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours
        });

        response.cookie('session_id', session_id, {
          maxAge: 1000 * 60 * 60 * 24, // 24 hours
          httpOnly: true,
          ...(process.env.NODE_ENV === 'production' && { secure: true }),
        });
      }
    }

    next();
  } catch (error: any) {
    next(error);
  }
};
