import { NAME_REGEX, PASSWORD_REGEX } from '../lib/constants';
import z from 'zod';

export const userRegistrationSchema = z.object({
  first_name: z
    .string({
      required_error: 'First name is required',
      invalid_type_error: 'First name should be a string value',
    })
    .min(3, 'First name cannot be less than 3 characters')
    .refine(
      (value) => NAME_REGEX.regex.test(value),
      NAME_REGEX.hint.bind({ label: 'First name' })
    ),
  last_name: z
    .string({
      required_error: 'Last name is required',
      invalid_type_error: 'Last name should be a string value',
    })
    .min(3, 'Last name cannot be less than 3 characters')
    .refine(
      (value) => NAME_REGEX.regex.test(value),
      NAME_REGEX.hint.bind({ label: 'Last name' })
    ),
  email: z
    .string({
      required_error: 'Email is required',
    })
    .min(1, 'Email cannot be empty')
    .email('Invalid email address')
    .trim()
    .toLowerCase(),
  password: z
    .string({
      required_error: 'Password is required',
    })
    .min(1, 'Password cannot be empty')
    .refine((value) => PASSWORD_REGEX.regex.test(value), PASSWORD_REGEX.hint),
});

export const userLoginSchema = z.object({
  email: z
    .string({
      required_error: 'Email is required',
    })
    .min(1, 'Email cannot be empty')
    .toLowerCase()
    .trim(),
  password: z
    .string({
      required_error: 'Password is required',
    })
    .min(1, 'Password cannot be empty'),
});

export const userEmailVerificationSchema = z.object({
  email: z
    .string({
      required_error: 'Email is required',
    })
    .min(1, 'Email cannot be empty')
    .email('Invalid email address')
    .toLowerCase()
    .trim(),
  OTP: z
    .string({
      required_error: 'OTP is required',
    })
    .min(6, 'Invalid OTP')
    .max(6, 'Invalid OTP')
    .trim(),
});

export const OTPResendSchema = z.object({
  email: z
    .string({
      required_error: 'Email is required',
    })
    .min(1, 'Email cannot be empty')
    .email('Invalid email address')
    .toLowerCase()
    .trim(),
});

export const passwordResetRequestSchema = z.object({
  email: z
    .string({
      required_error: 'Email is required',
    })
    .min(1, 'Email cannot be empty')
    .email('Invalid email address')
    .toLowerCase()
    .trim(),
});

export const passwordResetCompletionSchema = z.object({
  email: z
    .string({
      required_error: 'Email is required',
    })
    .min(1, 'Email cannot be empty')
    .email('Invalid email address')
    .toLowerCase()
    .trim(),
  OTP: z
    .string({
      required_error: 'OTP is required',
    })
    .min(6, 'Invalid OTP')
    .max(6, 'Invalid OTP')
    .trim(),
  new_password: z
    .string({
      required_error: 'New password is required',
    })
    .min(1, 'New password cannot be empty')
    .refine((value) => PASSWORD_REGEX.regex.test(value), PASSWORD_REGEX.hint),
});
