import z from 'zod';
import {
  ACCEPTED_IMAGE_TYPES,
  booleanEnum,
  booleanSchema,
  MAX_FILE_SIZE,
  MULTER_FILE_SCHEMA,
  numberFilterchema,
  SEARCH_QUERY_SCHEMA,
  SORT_ORDER_SCHEMA,
  stringSchema,
} from './constants';
import {} from 'multer';

export const getAllBrandsFilterSchema = z
  .object({
    search_query: SEARCH_QUERY_SCHEMA.optional(),
    is_deleted: booleanEnum('is_deleted').optional(),
    sort_by: z.enum(['name', 'date_created', 'date_updated']).optional(),
    sort_order: SORT_ORDER_SCHEMA.optional(),
    paginated: z.literal('true').optional(),
    page: numberFilterchema('page').optional(),
    limit: numberFilterchema('limit').optional(),
  })
  .refine((data) => !data.page || data.paginated, {
    path: ['page'],
    message: '"paginated" query parameter is not set.',
  })
  .refine((data) => !data.limit || data.paginated, {
    path: ['page'],
    message: '"paginated" query parameter is not set.',
  })
  .refine((data) => !data.sort_by || data.sort_order, {
    path: ['sort_order'],
    message: `Sorting order isn't specified`,
  });

export const getAvailableBrandsFilterSchema = z
  .object({
    search_query: SEARCH_QUERY_SCHEMA.optional(),
    sort_by: z.enum(['name', 'date_created', 'date_updated']).optional(),
    sort_order: SORT_ORDER_SCHEMA.optional(),
    paginated: z.literal('true').optional(),
    page: numberFilterchema('page').optional(),
    limit: numberFilterchema('limit').optional(),
  })
  .refine((data) => !data.page || data.paginated, {
    path: ['page'],
    message: '"paginated" query parameter is not set.',
  })
  .refine((data) => !data.limit || data.paginated, {
    path: ['page'],
    message: '"paginated" query parameter is not set.',
  })
  .refine((data) => !data.sort_by || data.sort_order, {
    path: ['sort_order'],
    message: `Sorting order isn't specified`,
  });

export const addBrandSchema = z.object({
  name: stringSchema('brand name'),
  logo: MULTER_FILE_SCHEMA.optional(),
});

export const brandUpdateSchema = z.object({
  name: stringSchema('brand name').optional(),
  logo: MULTER_FILE_SCHEMA.optional(),
  is_deleted: booleanSchema('is_deleted').optional(),
});
