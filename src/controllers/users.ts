import { NextFunction, Request, Response } from 'express';
import generateOTP from '../lib/generate-OTP';
import HttpError from '../lib/http-error';
import sendEmail from '../lib/send-email';
import EmailVerification from '../models/email-verification';
import Session from '../models/session';
import User from '../models/user';
// import { nanoid } from 'nanoid';
import {
  OTPResendSchema,
  passwordResetCompletionSchema,
  passwordResetRequestSchema,
  userEmailVerificationSchema,
  userLoginSchema,
  userRegistrationSchema,
} from '../schemas/user';
import validateSchema from '../lib/validate-schema';
import z from 'zod';
import bcrypt from 'bcrypt';
import PasswordReset from '../models/password-reset';

export const registerUser = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const data = validateSchema<z.infer<typeof userRegistrationSchema>>(
      request.body,
      userRegistrationSchema
    );

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
      html: `Use this OTP to complete your registration; ${OTP}`,
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
        message: `Account created successfully. Email verification OTP has been sent to ${email}`,
        data: new_user,
      });
  } catch (error: any) {
    next(error);
  }
};

export const loginUser = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const data = validateSchema<z.infer<typeof userLoginSchema>>(
      request.body,
      userLoginSchema
    );

    const { email, password } = data;

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      throw new HttpError('No user with the supplied email address', 404);
    }

    if (user && user.auth_type === 'google') {
      throw new HttpError(
        'Account already verified with Google. Sign in with Google instead.',
        400
      );
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      throw new HttpError('Incorrect password', 400);
    }

    const { nanoid } = await import('nanoid');
    const session_id = nanoid();

    await Session.create({
      user: user._id,
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
        message: `Login successful.`,
        data: { ...user, password: null },
      });
  } catch (error: any) {
    next(error);
  }
};

export const logoutUser = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const { session_id } = request.cookies;

    if (!session_id) {
      throw new HttpError('No active session found', 400);
    }

    await Session.deleteOne({ session_id });

    return response
      .cookie('session_id', '', { maxAge: 0 })
      .json({ message: 'Logout successful' });
  } catch (error: any) {
    next(error);
  }
};

export const verifyEmail = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const data = validateSchema<z.infer<typeof userEmailVerificationSchema>>(
      request.body,
      userEmailVerificationSchema
    );

    const { email, OTP } = data;

    const user = await User.findOne({ email });

    if (!user) {
      throw new HttpError('No user with the supplied email address', 404);
    }

    if (user && user.email_verified) {
      throw new HttpError(`User's email has already been verified`, 400);
    }

    const emailVerificationRecord = await EmailVerification.findOne({
      user: user._id,
    });

    if (!emailVerificationRecord) {
      throw new HttpError(
        'Email verification record does not exist or has expired',
        404
      );
    }

    const OTPMatches = await bcrypt.compare(OTP, emailVerificationRecord.OTP);

    if (!OTPMatches) {
      throw new HttpError('Incorrect OTP', 400);
    }

    user.email_verified = true;
    await user.save();

    await emailVerificationRecord.deleteOne();
    // await EmailVerification.deleteOne({ user: user._id });

    // TODO: send welcome email..?

    return response.json({ message: 'Email verified successfully' });
  } catch (error: any) {
    next(error);
  }
};

export const resendOTP = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const data = validateSchema<z.infer<typeof OTPResendSchema>>(
      request.body,
      OTPResendSchema
    );

    const { email } = data;

    const user = await User.findOne({ email });

    if (!user) {
      throw new HttpError('No user with the supplied email address', 404);
    }

    if (user && user.email_verified) {
      throw new HttpError(`User's email has already been verified`, 400);
    }

    await EmailVerification.deleteOne({ user: user._id });

    const OTP = generateOTP();

    await EmailVerification.create({
      user: user._id,
      OTP,
    });

    await sendEmail({
      receipent: email,
      subject: 'Email Verification',
      html: `Use this OTP to complete your registration; ${OTP}`,
    });

    return response
      .status(201)
      .json({ message: `Email verification OTP has been resent to ${email}` });
  } catch (error: any) {
    next(error);
  }
};

export const requestPasswordReset = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const data = validateSchema<z.infer<typeof passwordResetRequestSchema>>(
      request.body,
      passwordResetRequestSchema
    );

    const { email } = data;

    const user = await User.findOne({ email });

    if (!user) {
      throw new HttpError('No user with the supplied email address', 404);
    }

    if (user && user.auth_type === 'google') {
      throw new HttpError(
        `Account was verified with Google. Sign in with Google instead.`,
        400
      );
    }

    if (user && !user.email_verified) {
      throw new HttpError(`User's email has not been verified`, 401);
    }

    await PasswordReset.deleteOne({ user: user._id });

    const OTP = generateOTP();

    await PasswordReset.create({
      user: user._id,
      OTP,
    });

    await sendEmail({
      receipent: email,
      subject: 'Password',
      html: `Use this OTP to reset your password; ${OTP}`,
    });

    return response
      .status(201)
      .json({ message: `Password reset OTP has been sent to ${email}` });
  } catch (error: any) {
    next(error);
  }
};

export const completePasswordReset = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const data = validateSchema<z.infer<typeof passwordResetCompletionSchema>>(
      request.body,
      passwordResetCompletionSchema
    );

    const { email, OTP, new_password } = data;

    const user = await User.findOne({ email });

    if (!user) {
      throw new HttpError('No user with the supplied email address', 404);
    }

    if (user && user.auth_type === 'google') {
      throw new HttpError(
        `Account was verified with Google. Sign in with Google instead.`,
        400
      );
    }

    if (user && !user.email_verified) {
      throw new HttpError(`User's email has not been verified`, 401);
    }

    const passwordResetRecord = await PasswordReset.findOne({
      user: user._id,
    });

    if (!passwordResetRecord) {
      throw new HttpError(
        'Password reset record does not exist or has expired',
        404
      );
    }

    const OTPMatches = await bcrypt.compare(OTP, passwordResetRecord.OTP);

    if (!OTPMatches) {
      throw new HttpError('Incorrect OTP', 400);
    }

    user.password = new_password;
    await user.save();

    await passwordResetRecord.deleteOne();
    // await PasswordReset.deleteOne({ user: user._id });

    return response.json({ message: 'Password reset successfully' });
  } catch (error: any) {
    next(error);
  }
};
