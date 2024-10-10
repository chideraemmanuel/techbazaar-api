import { NAME_REGEX, PASSWORD_REGEX } from '../lib/constants';
import z from 'zod';

export const userRegistrationSchema = z.object({
  first_name: z
    .string()
    .min(3, 'First name cannot be less than 3 characters')
    .refine(
      (value) => NAME_REGEX.regex.test(value),
      NAME_REGEX.hint.bind({ label: 'First name' })
    ),
  last_name: z
    .string()
    .min(3, 'Last name cannot be less than 3 characters')
    .refine(
      (value) => NAME_REGEX.regex.test(value),
      NAME_REGEX.hint.bind({ label: 'Last name' })
    ),
  email: z
    .string()
    .min(1, 'Please supply an email address')
    .email('Invalid email address')
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .refine((value) => PASSWORD_REGEX.regex.test(value), PASSWORD_REGEX.hint),
});

export const userLoginSchema = z.object({
  email: z
    .string()
    .min(1, 'Please supply an email address')
    .toLowerCase()
    .trim(),
  password: z.string().min(1, 'Please supply your password'),
});

export const userEmailVerificationSchema = z.object({
  email: z
    .string()
    .min(1, 'Please supply an email address')
    .email('Invalid email address')
    .toLowerCase()
    .trim(),
  OTP: z.string().min(6, 'Invalid OTP').max(6, 'Invalid OTP').trim(),
});

export const OTPResendSchema = z.object({
  email: z
    .string()
    .min(1, 'Please supply an email address')
    .email('Invalid email address')
    .toLowerCase()
    .trim(),
});

export const passwordResetRequestSchema = z.object({
  email: z
    .string()
    .min(1, 'Please supply an email address')
    .email('Invalid email address')
    .toLowerCase()
    .trim(),
});

export const passwordResetCompletionSchema = z.object({
  email: z
    .string()
    .min(1, 'Please supply an email address')
    .email('Invalid email address')
    .toLowerCase()
    .trim(),
  OTP: z.string().min(6, 'Invalid OTP').max(6, 'Invalid OTP').trim(),
  new_password: z
    .string()
    .refine((value) => PASSWORD_REGEX.regex.test(value), PASSWORD_REGEX.hint),
});
