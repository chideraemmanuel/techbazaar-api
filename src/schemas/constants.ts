import {
  NAME_REGEX,
  PASSWORD_VALIDATION,
  PRODUCT_CATEGORIES_ARRAY,
} from '../lib/constants';
import isValidISODate from '../lib/is-valid-ISO-date';
import mongoose from 'mongoose';
import z from 'zod';

export const FIRST_NAME_SCHEMA = z
  .string({
    invalid_type_error: 'Invalid first name provided. Must be a string.',
    required_error: 'First name is required.',
  })
  .min(2, 'First name must be at least 2 characters long.')
  .max(50, 'First name must be at most 50 characters long.')
  .regex(NAME_REGEX, 'First name contains invalid characters.');

export const LAST_NAME_SCHEMA = z
  .string({
    invalid_type_error: 'Invalid last name provided. Must be a string.',
    required_error: 'Last name is required.',
  })
  .min(2, 'Last name must be at least 2 characters long.')
  .max(50, 'Last name must be at most 50 characters long.')
  .regex(NAME_REGEX, 'Last name contains invalid characters.');

export const EMAIL_SCHEMA = z
  .string({
    required_error: 'Email is required.',
  })
  .min(1, 'Email cannot be an empty string.')
  .email('Invalid email address')
  .trim()
  .toLowerCase();

export const PASSWORD_SCHEMA = z
  .string({
    invalid_type_error: 'Invalid password provided. Must be a string.',
  })
  .min(1, 'Password cannot be an empty string')
  .regex(PASSWORD_VALIDATION.regex, PASSWORD_VALIDATION.hint);

export const stringSchema = (
  label: string,
  min: number = 1,
  max: number = 100
) => {
  return z
    .string({
      invalid_type_error: `Invalid ${label} provided. Must be a string.`,
      required_error: `${label} is required`,
    })
    .min(
      min,
      min === 1
        ? `${label} cannot be an empty string.`
        : `${label} must be at least ${min} characters long.`
    )
    .max(max, `${label} must be at most ${max} characters long.`);
};

export const SEARCH_QUERY_SCHEMA = z
  .string()
  .min(1, 'search_query cannot be an empty string.');

export const stringFilterchema = (label: string) => {
  return z.string().min(1, `${label} cannot be an empty string.`);
};

export const numberSchema = (
  label: string,
  min: number = 1,
  max: number = 10000
) => {
  return z
    .number({
      invalid_type_error: `Invalid ${label} provided. Must be a numeric value.`,
      required_error: `${label} is required`,
    })
    .min(min, `${label} cannot be less than ${min}.`)
    .max(max, `${label} cannot be more than ${max}.`)
    .positive(`${label} must be a positive numeric value`); // unnecessary..?
};

export const numberFilterchema = (label: string) => {
  return z
    .string()
    .refine((value) => !isNaN(Number(value)), {
      message: `Invalid ${label}. Must be a valid number.`,
    })
    .transform((value) => (value ? Number(value) : undefined));
};

export const MAX_PRODUCT_PRICE = 1000000;
export const MAX_STOCK_COUNT = 10000;

export const SORT_ORDER_SCHEMA = z.enum(['ascending', 'descending'], {
  invalid_type_error:
    'Invalid sort_order value provided. Must be either "ascending" or "descending".',
});

export const ObjectIdSchema = (label: string) => {
  return z
    .string()
    .refine((value) => mongoose.isValidObjectId(value), `Invalid ${label} ID.`)
    .transform((value) => new mongoose.Types.ObjectId(value));
};

export const booleanSchema = (label: string) => {
  return z.boolean({
    invalid_type_error: `Invalid "${label}" value provided. Must be a boolean.`,
  });
};

export const booleanEnum = (label: string) => {
  return z
    .enum(['true', 'false'], {
      invalid_type_error: `Invalid ${label} value provided. Must be a boolean.`,
    })
    .transform((value) => value === 'true');
};

export const AUTH_TYPE_SCHEMA = z.enum(['manual', 'google'], {
  invalid_type_error: 'Invalid auth_type value provided.',
});

export const ROLE_SCHEMA = z.enum(['user', 'admin'], {
  invalid_type_error: 'Invalid role provided.',
});

export const ORDER_STATUS_SCHEMA = z.enum([
  'pending',
  'processing',
  'in-transit',
  'dispatched',
  'partially-shipped',
  'out-for-delivery',
  'shipped',
  'delivered',
  'cancelled',
]);

export const ISODateSchema = (label: string) => {
  return z
    .string()
    .refine(isValidISODate, {
      message: `Invalid ${label}. Must be in YYYY-MM-DD format.`,
    })
    .transform((value) => new Date(value));
};

export const PRODUCT_CATEGORY_SCHEMA = z
  .enum([
    'smartphones',
    'tablets',
    'laptops',
    'headphones',
    'speakers',
    'smartwatches',
    'gaming-consoles',
  ])
  .refine(
    (value) => PRODUCT_CATEGORIES_ARRAY.includes(value),
    'Invalid category'
  );

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];
