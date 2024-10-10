import { NextFunction, Request, Response } from 'express';
import generateOTP from '../lib/generate-OTP';
import HttpError from '../lib/http-error';
import sendEmail from '../lib/send-email';
import EmailVerification from '../models/email-verification';
import Session from '../models/session';
import User from '../models/user';
// import { nanoid } from 'nanoid';
import { userRegistrationSchema } from '../schemas/user';

export const registerUser = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const { success, error, data } = userRegistrationSchema.safeParse(
      request.body
    );

    if (!success) {
      console.log('error.format()._errors', error.format()._errors);

      throw new HttpError(error.format()._errors[0], 400);
    }

    const { first_name, last_name, email, password } = data;

    const emailInUse = await User.findOne({ email });

    if (emailInUse) throw new HttpError('Email is already in use', 400);

    const new_user = await User.create({
      first_name,
      last_name,
      email,
      password,
      auth_type: 'manual',
    });

    const OTP = generateOTP();

    await EmailVerification.create({
      user: new_user._id,
      OTP,
    });

    await sendEmail({
      receipent: email,
      subject: 'Email Verification',
      html: `Enter this OTP to complete your registration; ${OTP}`,
    });

    const { nanoid } = await import('nanoid');
    const session_id = nanoid();

    await Session.create({
      user: new_user._id,
      session_id,
    });

    return response
      .status(201)
      .cookie('session_id', session_id, {
        maxAge: 60 * 60 * 24, // 24 hours
        httpOnly: true,
        ...(process.env.NODE_ENV === 'production' && { secure: true }),
      })
      .json({
        message: `Account created successfully. Verification email has been sent to ${email}`,
      });
  } catch (error: any) {
    next(error);
  }
};
