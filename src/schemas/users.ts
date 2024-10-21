import z from 'zod';
import {
  AUTH_TYPE_SCHEMA,
  booleanEnum,
  booleanSchema,
  FIRST_NAME_SCHEMA,
  ISODateSchema,
  LAST_NAME_SCHEMA,
  numberFilterchema,
  ObjectIdSchema,
  ORDER_STATUS_SCHEMA,
  PASSWORD_SCHEMA,
  ROLE_SCHEMA,
  SEARCH_QUERY_SCHEMA,
  SORT_ORDER_SCHEMA,
} from './constants';
import validateISODateRange from 'lib/validate-ISO-date-range';

export const updateCurrentUserSchema = z.object({
  first_name: FIRST_NAME_SCHEMA.optional(),
  last_name: LAST_NAME_SCHEMA.optional(),
  password: PASSWORD_SCHEMA.optional(),
});

export const getCurrentUserCartFilterSchema = z
  .object({
    page: numberFilterchema('page').optional(),
    limit: numberFilterchema('limit').optional(),
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
    page: numberFilterchema('page').optional(),
    limit: numberFilterchema('limit').optional(),
    sort_by: z
      .enum(['first_name', 'last_name', 'email'], {
        invalid_type_error: 'Invalid sort_by value provided.',
      })
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
    page: numberFilterchema('page').optional(),
    limit: numberFilterchema('limit').optional(),
    sort_by: z.enum(['date_created', 'date_updated']).optional(),
    sort_order: SORT_ORDER_SCHEMA.optional(),
  })
  .refine(
    (data) => {
      validateISODateRange(data.start_date, data.end_date);
    },
    {
      message: 'start_date must be before or equal to end_date.',
      path: ['end_date'],
    }
  )
  .refine((data) => !data.sort_by || data.sort_order, {
    path: ['sort_order'],
    message: `Sorting order isn't specified`,
  });

const orderItemSchema = z.object({
  product: ObjectIdSchema('product'),
  quantity: z
    .number({
      invalid_type_error: 'Invalid quantity. Must be a number.',
    })
    .min(1, 'Minimum product quantity is 1'),
});

const receipentSchema = z.object({
  first_name: FIRST_NAME_SCHEMA,
  last_name: LAST_NAME_SCHEMA,
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
