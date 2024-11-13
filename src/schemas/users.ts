import z from 'zod';
import {
  AUTH_TYPE_SCHEMA,
  booleanEnum,
  booleanSchema,
  FIRST_NAME_SCHEMA,
  ISODateSchema,
  LAST_NAME_SCHEMA,
  numberFilterSchema,
  ObjectIdSchema,
  ORDER_STATUS_SCHEMA,
  PASSWORD_SCHEMA,
  ROLE_SCHEMA,
  SEARCH_QUERY_SCHEMA,
  SORT_ORDER_SCHEMA,
} from './constants';
import validateISODateRange from '../lib/validate-ISO-date-range';
import { PHONE_NUMBER_REGEX } from '../lib/constants';

export const updateCurrentUserSchema = z.object({
  first_name: FIRST_NAME_SCHEMA.optional(),
  last_name: LAST_NAME_SCHEMA.optional(),
  password: PASSWORD_SCHEMA.optional(),
});

export const getCurrentUserWishlistFilterSchema = z
  .object({
    page: numberFilterSchema('page').optional(),
    limit: numberFilterSchema('limit').optional(),
    sort_by: z
      .enum(['date_created', 'date_updated'], {
        invalid_type_error: 'Invalid sort_by value provided.',
      })
      .optional(),
    sort_order: SORT_ORDER_SCHEMA.optional(),
  })
  .refine((data) => !data.sort_by || data.sort_order, {
    path: ['sort_order'],
    message: `sort_order must be specified if sort_by is specified.`,
  });

export const addItemToWishlistSchema = z.object({
  product: ObjectIdSchema('product'),
});

export const getCurrentUserCartFilterSchema = z
  .object({
    page: numberFilterSchema('page').optional(),
    limit: numberFilterSchema('limit').optional(),
    sort_by: z
      .enum(['date_created', 'date_updated'], {
        invalid_type_error: 'Invalid sort_by value provided.',
      })
      .optional(),
    sort_order: SORT_ORDER_SCHEMA.optional(),
  })
  .refine((data) => !data.sort_by || data.sort_order, {
    path: ['sort_order'],
    message: `sort_order must be specified if sort_by is specified.`,
  });

export const addItemToCartSchema = z.object({
  product: ObjectIdSchema('product'),
});

export const getUsersFilterSchema = z
  .object({
    search_query: SEARCH_QUERY_SCHEMA.optional(),
    email_verified: booleanEnum('email_verified').optional(),
    auth_type: AUTH_TYPE_SCHEMA.optional(),
    role: ROLE_SCHEMA.optional(),
    disabled: booleanEnum('email_verified').optional(),
    page: numberFilterSchema('page').optional(),
    limit: numberFilterSchema('limit').optional(),
    sort_by: z
      .enum(
        ['first_name', 'last_name', 'email', 'date_created', 'date_updated'],
        {
          invalid_type_error: 'Invalid sort_by value provided.',
        }
      )
      .optional(),
    sort_order: SORT_ORDER_SCHEMA.optional(),
  })
  .refine((data) => !data.sort_by || data.sort_order, {
    path: ['sort_order'],
    message: `sort_order must be specified if sort_by is specified.`,
  });

export const updateUserStatusSchema = z.object({
  role: ROLE_SCHEMA.optional(),
  disabled: booleanSchema('disabled').optional(),
});

export const getUserOrdersFilterSchema = z
  .object({
    status: ORDER_STATUS_SCHEMA.optional(),
    start_date: ISODateSchema('start_date').optional(),
    end_date: ISODateSchema('end_date').optional(),
    page: numberFilterSchema('page').optional(),
    limit: numberFilterSchema('limit').optional(),
    sort_by: z.enum(['date_created', 'date_updated']).optional(),
    sort_order: SORT_ORDER_SCHEMA.optional(),
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

// const orderItemSchema = z.object({
//   product: ObjectIdSchema('product'),
//   quantity: z
//     .number({
//       invalid_type_error: 'Invalid quantity. Must be a number.',
//     })
//     .min(1, 'Minimum product quantity is 1'),
// });

const receipentSchema = z.object({
  first_name: FIRST_NAME_SCHEMA,
  last_name: LAST_NAME_SCHEMA,
  mobile_number: z
    .string({
      required_error: `Receipent's mobile number is required.`,
    })
    .regex(PHONE_NUMBER_REGEX, 'Invalid mobile number.'),
});

// TODO: validate address properly
const addressSchema = z.object({
  street: z
    .string({
      required_error: 'Street is required.',
    })
    .min(1, 'Street cannot be empty.'),
  city: z
    .string({
      required_error: 'City is required.',
    })
    .min(2, 'City cannot be less than 2 characters.'),
  state: z
    .string({
      required_error: 'State is required.',
    })
    .min(2, 'State cannot be less than 2 characters.'),
  country: z
    .string({
      required_error: 'Country is required.',
    })
    .min(3, 'Country cannot be less than 3 characters.'),
});

export const placeOrderSchema = z
  .object({
    // items: z.array(orderItemSchema),
    billing_information: z
      .object({
        receipent: receipentSchema,
        address: addressSchema,
      })
      .optional(),
    use_saved_billing_information: booleanSchema(
      'use_saved_billing_information'
    ).optional(),
  })
  .refine(
    (data) => data.billing_information || data.use_saved_billing_information,
    {
      path: ['billing_information'],
      message: 'Must specify billing information.',
    }
  );
