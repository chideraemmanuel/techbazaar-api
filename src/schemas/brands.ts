import z from 'zod';
import {
  ACCEPTED_IMAGE_TYPES,
  booleanEnum,
  booleanSchema,
  MAX_FILE_SIZE,
  numberFilterchema,
  SEARCH_QUERY_SCHEMA,
  SORT_ORDER_SCHEMA,
  stringSchema,
} from './constants';

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
  logo: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, 'Max file size is 5MB.')
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      'Only JPEG, JPG, PNG, and WebP formats are supported.'
    )
    .optional(),
});

export const brandUpdateSchema = z.object({
  name: stringSchema('brand name').optional(),
  logo: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, 'Max file size is 5MB.')
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      'Only JPEG, JPG, PNG, and WebP formats are supported.'
    )
    .optional(),
  is_deleted: booleanSchema('is_deleted').optional(),
});
