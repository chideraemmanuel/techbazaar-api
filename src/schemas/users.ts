import mongoose from 'mongoose';
import { NAME_REGEX, PASSWORD_REGEX } from '../lib/constants';
import z from 'zod';
import isValidISODate from 'lib/is-valid-ISO-date';

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
    status: z
      .enum(['pending', 'dispatched', 'shipped', 'delivered'])
      .optional(),
    start_date: z
      .string()
      .optional()
      .refine(isValidISODate, {
        message: 'Invalid start_date. Must be in YYYY-MM-DD format.',
      })
      .transform((value) => new Date(value)),
    end_date: z
      .string()
      .optional()
      .refine(isValidISODate, {
        message: 'Invalid end_date. Must be in YYYY-MM-DD format.',
      })
      .transform((value) => new Date(value)),
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
  .refine(
    (data) => {
      if (data.start_date && data.end_date) {
        const startDate = new Date(data.start_date);
        const endDate = new Date(data.end_date);
        return startDate <= endDate;
      }
      return true; // If one or both dates are missing, skip this validation
    },
    {
      message: 'start_date must be before or equal to end_date.',
      path: ['end_date'], // Attach the error to the end_date field
    }
  )
  .refine((data) => !data.sort_by || data.sort_order, {
    path: ['sort_order'],
    message: `Sorting order isn't specified`,
  });

const orderItemSchema = z.object({
  product: z
    .instanceof(mongoose.Types.ObjectId)
    .refine((value) => mongoose.isValidObjectId(value), 'Invalid product ID'),
  quantity: z
    .number({
      invalid_type_error: 'Product quantity should be a number',
    })
    .min(1, 'Minimum product quantity is 1'),
});

const receipentSchema = z.object({
  first_name: z
    .string({
      required_error: `Receipent's first name is required`,
      invalid_type_error: `Receipent's first name should be a string value`,
    })
    .min(3, `Receipent's first name cannot be less than 3 characters`)
    .refine(
      (value) => NAME_REGEX.regex.test(value),
      NAME_REGEX.hint.bind({ label: `Receipent's first name` })
    ),
  last_name: z
    .string({
      required_error: `Receipent's last name is required`,
      invalid_type_error: `Receipent's last name should be a string value`,
    })
    .min(3, `Receipent's last name cannot be less than 3 characters`)
    .refine(
      (value) => NAME_REGEX.regex.test(value),
      NAME_REGEX.hint.bind({ label: `Receipent's last name` })
    ),
  mobile_number: z.number({
    // TODO: validate number properly
    required_error: `Receipent's mobile number is required`,
  }),
});

// TODO: validate address properly
const addressSchema = z.object({
  street: z
    .string({
      required_error: 'Street is required',
    })
    .min(1, 'Street cannot be empty'),
  city: z
    .string({
      required_error: 'City is required',
    })
    .min(2, 'City cannot be less than 2 characters'),
  state: z
    .string({
      required_error: 'State is required',
    })
    .min(2, 'State cannot be less than 2 characters'),
  country: z
    .string({
      required_error: 'Country is required',
    })
    .min(3, 'Country cannot be less than 3 characters'),
});

export const placeOrderSchema = z.object({
  items: z.array(orderItemSchema),
  billing: z.object({
    receipent: receipentSchema,
    address: addressSchema,
  }),
});
