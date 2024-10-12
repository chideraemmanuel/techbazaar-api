import { NAME_REGEX, PASSWORD_REGEX } from '../lib/constants';
import z from 'zod';

export const updateCurrentUserSchema = z.object({
  first_name: z
    .string({
      invalid_type_error: 'First name should be a string value',
    })
    .min(3, 'First name cannot be less than 3 characters')
    .refine(
      (value) => NAME_REGEX.regex.test(value),
      NAME_REGEX.hint.bind({ label: 'First name' })
    )
    .optional(),
  last_name: z
    .string({
      invalid_type_error: 'Last name should be a string value',
    })
    .min(3, 'Last name cannot be less than 3 characters')
    .refine(
      (value) => NAME_REGEX.regex.test(value),
      NAME_REGEX.hint.bind({ label: 'Last name' })
    )
    .optional(),
  password: z
    .string()
    .min(1, 'Password cannot be empty')
    .refine((value) => PASSWORD_REGEX.regex.test(value), PASSWORD_REGEX.hint)
    .optional(),
});
