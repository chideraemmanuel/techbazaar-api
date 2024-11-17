import z from 'zod';
import {
  EMAIL_SCHEMA,
  FIRST_NAME_SCHEMA,
  LAST_NAME_SCHEMA,
  PASSWORD_SCHEMA,
  stringSchema,
} from './constants';

export const userRegistrationSchema = z.object({
  first_name: FIRST_NAME_SCHEMA,
  last_name: LAST_NAME_SCHEMA,
  email: EMAIL_SCHEMA,
  password: PASSWORD_SCHEMA,
});

export const userLoginSchema = z.object({
  email: EMAIL_SCHEMA,
  password: stringSchema('password'),
});

export const googleOAuthURIParamSchema = z
  .object({
    success_redirect_path: stringSchema('success_redirect_path')
      .refine((value) => value.startsWith('/'), 'Invalid success_redirect_path')
      .optional(),
    error_redirect_path: stringSchema('error_redirect_path')
      .refine((value) => value.startsWith('/'), 'Invalid error_redirect_path')
      .optional(),
  })
  .refine(
    (value) => !value.success_redirect_path || value.error_redirect_path,
    {
      path: ['error_redirect_path'],
      message: 'error_redirect_path is not specified.',
    }
  )
  .refine(
    (value) => !value.error_redirect_path || value.success_redirect_path,
    {
      path: ['success_redirect_path'],
      message: 'success_redirect_path is not specified.',
    }
  );

export const userEmailVerificationSchema = z.object({
  email: EMAIL_SCHEMA,
  OTP: z
    .string({
      required_error: 'OTP is required',
    })
    .min(6, 'Invalid OTP')
    .max(6, 'Invalid OTP')
    .trim(),
});

export const OTPResendSchema = z.object({
  email: EMAIL_SCHEMA,
});

export const passwordResetRequestSchema = z.object({
  email: EMAIL_SCHEMA,
});

export const passwordResetCompletionSchema = z.object({
  email: EMAIL_SCHEMA,
  OTP: z
    .string({
      required_error: 'OTP is required',
    })
    .min(6, 'Invalid OTP')
    .max(6, 'Invalid OTP')
    .trim(),
  new_password: PASSWORD_SCHEMA,
});
