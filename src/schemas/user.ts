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
  email: z.string().email('Invalid email address').trim().toLowerCase(),
  password: z
    .string()
    .refine((value) => PASSWORD_REGEX.regex.test(value), PASSWORD_REGEX.hint),
});
