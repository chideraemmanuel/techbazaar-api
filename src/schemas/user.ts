import mongoose from 'mongoose';
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

export const getCurrentUserCartFilterSchema = z
  .object({
    page: z
      .string()
      .refine((value) => /^\d$/.test(value), 'Page should be a numeric value')
      .optional(),
    limit: z
      .string()
      .refine((value) => /^\d$/.test(value), 'Limit should be a numeric value')
      .optional(),
    sort_by: z.enum(['date_created', 'date_updated']).optional(),
    sort_order: z.enum(['ascending', 'descending']).optional(),
  })
  .refine((data) => !data.sort_by || data.sort_order, {
    path: ['sort_order'],
    message: `Sorting order isn't specified`,
  });

export const addItemToCartSchema = z.object({
  product: z
    .instanceof(mongoose.Types.ObjectId)
    .refine((value) => mongoose.isValidObjectId(value), 'Invalid product ID'),
  // .string()
  // .refine((value) => mongoose.isValidObjectId(value), 'Invalid product ID'),
});

export const getUsersFilterSchema = z
  .object({
    search_query: z
      .string()
      .min(1, 'Search query string cannot be empty')
      .optional(),
    email_verified: z.enum(['true', 'false']).optional(),
    auth_type: z.enum(['manual', 'google']).optional(),
    role: z.enum(['user', 'admin']).optional(),
    disabled: z.enum(['true', 'false']).optional(),
    page: z
      .string()
      .refine((value) => /^\d$/.test(value), 'Page should be a numeric value')
      .optional(),
    limit: z
      .string()
      .refine((value) => /^\d$/.test(value), 'Limit should be a numeric value')
      .optional(),
    sort_by: z.enum(['first_name', 'last_name', 'email']).optional(),
    sort_order: z.enum(['ascending', 'descending']).optional(),
  })
  .refine((data) => !data.sort_by || data.sort_order, {
    path: ['sort_order'],
    message: `Sorting order isn't specified`,
  });

export const updateUserStatusSchema = z.object({
  role: z.enum(['user', 'admin']).optional(),
  disabled: z.boolean().optional(),
});

export const getUserOrdersFilterSchema = z
  .object({
    status: z.enum(['pending', 'shipped', 'delivered']).optional(),
    // date_range: z.string().optional(),
    page: z
      .string()
      .refine((value) => /^\d$/.test(value), 'Page should be a numeric value')
      .optional(),
    limit: z
      .string()
      .refine((value) => /^\d$/.test(value), 'Limit should be a numeric value')
      .optional(),
    sort_by: z.enum(['date_created', 'date_updated']).optional(),
    sort_order: z.enum(['ascending', 'descending']).optional(),
  })
  .refine((data) => !data.sort_by || data.sort_order, {
    path: ['sort_order'],
    message: `Sorting order isn't specified`,
  });
