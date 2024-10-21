import { NAME_REGEX } from '../lib/constants';
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
