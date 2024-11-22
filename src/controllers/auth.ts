import { NextFunction, Request, Response } from 'express';
import generateOTP from '../lib/generate-OTP';
import HttpError from '../lib/http-error';
import sendEmail from '../lib/send-email';
import EmailVerification from '../models/email-verification';
import Session from '../models/session';
import User from '../models/user';
// import { nanoid } from 'nanoid';
import {
  googleOAuthURIParamSchema,
  OTPResendSchema,
  passwordResetCompletionSchema,
  passwordResetRequestSchema,
  userEmailVerificationSchema,
  userLoginSchema,
  userRegistrationSchema,
} from '../schemas/auth';
import validateSchema from '../lib/validate-schema';
import z from 'zod';
import bcrypt from 'bcrypt';
import PasswordReset from '../models/password-reset';
import { EMAIL_SCHEMA } from '../schemas/constants';
import jwt from 'jsonwebtoken';

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

    const new_user_return = { ...new_user.toObject() };
    delete new_user_return['password'];

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

    response
      .status(201)
      .cookie('session_id', session_id, {
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
        httpOnly: true,
        ...(process.env.NODE_ENV === 'production' && {
          secure: true,
          sameSite: 'none',
        }),
      })
      .json({
        message: `Account created successfully. Email verification OTP has been sent to ${email}`,
        data: new_user_return,
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

    const user = await User.findOne({ email }).select('+password').lean();

    if (!user) {
      throw new HttpError('No user with the supplied email address', 404);
    }

    if (user && user.auth_type === 'google') {
      throw new HttpError(
        'Account already verified with Google. Sign in with Google instead.',
        400
      );
    }

    if (user && user.disabled) {
      throw new HttpError('Unauthorized access', 401);
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

    const user_return = { ...user };
    delete user_return['password'];

    response
      .status(201)
      .cookie('session_id', session_id, {
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
        httpOnly: true,
        ...(process.env.NODE_ENV === 'production' && {
          secure: true,
          sameSite: 'none',
        }),
      })
      .json({
        message: `Login successful.`,
        data: user_return,
      });
  } catch (error: any) {
    next(error);
  }
};

export const getGoogleOAuthURI = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const data = validateSchema<z.infer<typeof googleOAuthURIParamSchema>>(
      request.query,
      googleOAuthURIParamSchema
    );

    const { success_redirect_path, error_redirect_path } = data;

    const base_auth_uri = 'https://accounts.google.com/o/oauth2/v2/auth';

    const redirect_uri =
      success_redirect_path && error_redirect_path
        ? `${process.env.API_BASE_URL}/auth/google?success_redirect_path=${success_redirect_path}&error_redirect_path=${error_redirect_path}`
        : `${process.env.API_BASE_URL}/auth/google`;

    const options = {
      response_type: 'code',
      client_id: process.env.GOOGLE_AUTH_CLIENT_ID!,
      redirect_uri,
      scope: [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
      ].join(' '),
      access_type: 'offline',
    };

    const queryStrings = new URLSearchParams(options);

    const full_auth_uri = `${base_auth_uri}?${queryStrings.toString()}`;

    response.json({ uri: full_auth_uri });
  } catch (error: any) {
    next(error);
  }
};

interface GoogleResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string; // same scope that was used to generate the authentication uri
  token_type: 'Bearer';
  id_token: string;
}

interface GoogleUserData {
  iss: 'https://accounts.google.com';
  azp: string;
  aud: string;
  sub: string;
  email: string;
  email_verified: boolean;
  at_hash: string;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
  locale: string;
  iat: number;
  exp: number;
}

export const authenticateUserWithGoogle = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const data = validateSchema<z.infer<typeof googleOAuthURIParamSchema>>(
    request.query,
    googleOAuthURIParamSchema
  );

  const { success_redirect_path, error_redirect_path } = data;

  try {
    const { code } = request.query;

    if (!code) {
      if (success_redirect_path && error_redirect_path) {
        response.redirect(
          `${process.env.CLIENT_BASE_URL}${error_redirect_path}?error=authentication_failed`
        );

        return;
      } else {
        throw new HttpError('Authentication failed', 401);
      }
    }

    const base_token_uri = 'https://oauth2.googleapis.com/token';

    const redirect_uri =
      success_redirect_path && error_redirect_path
        ? `${process.env.API_BASE_URL}/auth/google?success_redirect_path=${success_redirect_path}&error_redirect_path=${error_redirect_path}`
        : `${process.env.API_BASE_URL}/auth/google`;

    const options = {
      code,
      client_id: process.env.GOOGLE_AUTH_CLIENT_ID!,
      client_secret: process.env.GOOGLE_AUTH_CLIENT_SECRET!,
      redirect_uri,
      grant_type: 'authorization_code',
    };

    const res = await fetch(base_token_uri, {
      method: 'POST',
      body: JSON.stringify(options),
    });

    if (!res.ok) {
      if (success_redirect_path && error_redirect_path) {
        response.redirect(
          `${process.env.CLIENT_BASE_URL}${error_redirect_path}?error=authentication_failed`
        );

        return;
      } else {
        throw new HttpError('Authentication failed', 422);
      }
    }

    // @ts-ignore
    const google_response: GoogleResponse = await res.json();

    // @ts-ignore
    const user_data: GoogleUserData = jwt.decode(google_response.id_token);

    const { email, given_name, family_name, picture } = user_data;

    const user = await User.findOne({ email, email_verified: true });

    if (user?.auth_type === 'manual') {
      if (success_redirect_path && error_redirect_path) {
        response.redirect(
          `${process.env.CLIENT_BASE_URL}${error_redirect_path}?error=account_exists`
        );

        return;
      } else {
        throw new HttpError(
          'User with the provided email address already exists. Sign in with password instead.',
          422
        );
      }
    }

    if (user?.auth_type === 'google') {
      if (user.disabled) {
        if (success_redirect_path && error_redirect_path) {
          response.redirect(
            `${process.env.CLIENT_BASE_URL}${error_redirect_path}?error=unauthorized_access`
          );

          return;
        } else {
          throw new HttpError('Unauthorized access', 401);
        }
      }

      // user not disabled
      // create session and login
      const { nanoid } = await import('nanoid');
      const session_id = nanoid();

      await Session.create({
        user: user._id,
        session_id,
      });

      if (success_redirect_path && error_redirect_path) {
        response
          .cookie('session_id', session_id, {
            maxAge: 1000 * 60 * 60 * 24, // 24 hours
            httpOnly: true,
            ...(process.env.NODE_ENV === 'production' && {
              secure: true,
              sameSite: 'none',
            }),
          })
          .redirect(
            `${process.env.CLIENT_BASE_URL}${success_redirect_path}?new_account=false`
          );
      } else {
        response
          .status(201)
          .cookie('session_id', session_id, {
            maxAge: 1000 * 60 * 60 * 24, // 24 hours
            httpOnly: true,
            ...(process.env.NODE_ENV === 'production' && {
              secure: true,
              sameSite: 'none',
            }),
          })
          .json({
            message: `Login successful.`,
            data: user,
          });
      }

      return;
    }

    // account with email doesn't exist
    // create new account and session, and sign in
    const new_user = await User.create({
      first_name: given_name,
      last_name: family_name,
      email,
      email_verified: true,
      auth_type: 'google',
    });

    // TODO: send welcome email..?

    const { nanoid } = await import('nanoid');
    const session_id = nanoid();

    await Session.create({
      user: new_user._id,
      session_id,
    });

    if (success_redirect_path && error_redirect_path) {
      response
        .cookie('session_id', session_id, {
          maxAge: 1000 * 60 * 60 * 24, // 24 hours
          httpOnly: true,
          ...(process.env.NODE_ENV === 'production' && {
            secure: true,
            sameSite: 'none',
          }),
        })
        .redirect(
          `${process.env.CLIENT_BASE_URL}${success_redirect_path}?new_account=true`
        );
    } else {
      response
        .status(201)
        .cookie('session_id', session_id, {
          maxAge: 1000 * 60 * 60 * 24, // 24 hours
          httpOnly: true,
          ...(process.env.NODE_ENV === 'production' && {
            secure: true,
            sameSite: 'none',
          }),
        })
        .json({
          message: `Account created successfully.`,
          data: new_user,
        });
    }
  } catch (error: any) {
    if (success_redirect_path && error_redirect_path) {
      response.redirect(
        `${process.env.CLIENT_BASE_URL}${error_redirect_path}?error=authentication_failed`
      );

      return;
    }

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

    response
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

    // TODO: send welcome email..?

    response.json({ message: 'Email verified successfully', data: user });
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

    response
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

    response
      .status(201)
      .json({ message: `Password reset OTP has been sent to ${email}` });
  } catch (error: any) {
    next(error);
  }
};

export const findPasswordResetRequestRecord = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const { email } = request.query;

    if (!email)
      throw new HttpError('Email is missing in query parameters.', 400);

    const validatedEmail = validateSchema<z.infer<typeof EMAIL_SCHEMA>>(
      email,
      EMAIL_SCHEMA
    );

    const user = await User.findOne({ email: validatedEmail });

    if (!user) {
      throw new HttpError('No user with the supplied email address', 404);
    }

    const password_reset_record = await PasswordReset.findOne({
      user: user._id,
    });

    if (!password_reset_record) {
      // throw new HttpError('', 422);
      response.status(204).json(null);
      return;
    }

    response.json({ message: 'Password reset record exists' });
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

    response.json({ message: 'Password reset successfully' });
  } catch (error: any) {
    next(error);
  }
};
