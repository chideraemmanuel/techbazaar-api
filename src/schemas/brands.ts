import z from 'zod';

export const getAllBrandsFilterSchema = z
  .object({
    search_query: z
      .string()
      .min(1, 'Search query string cannot be empty')
      .optional(),
    is_deleted: z.enum(['true', 'false']).optional(),
    sort_by: z.enum(['name', 'date_created', 'date_updated']).optional(),
    sort_order: z.enum(['ascending', 'descending']).optional(),
    paginated: z.literal('true').optional(),
    page: z
      .string()
      .refine((value) => /^\d$/.test(value), 'Page should be a numeric value')
      .optional(),
    limit: z
      .string()
      .refine((value) => /^\d$/.test(value), 'Limit should be a numeric value')
      .optional(),
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
    search_query: z
      .string()
      .min(1, 'Search query string cannot be empty')
      .optional(),
    sort_by: z.enum(['name', 'date_created', 'date_updated']).optional(),
    sort_order: z.enum(['ascending', 'descending']).optional(),
    paginated: z.literal('true').optional(),
    page: z
      .string()
      .refine((value) => /^\d$/.test(value), 'Page should be a numeric value')
      .optional(),
    limit: z
      .string()
      .refine((value) => /^\d$/.test(value), 'Limit should be a numeric value')
      .optional(),
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

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

export const addBrandSchema = z.object({
  name: z
    .string({
      required_error: 'Brand name is required',
    })
    .min(1, 'Brand name cannot be empty'),
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
  name: z.string().min(1, 'Brand name cannot be empty').optional(),
  logo: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, 'Max file size is 5MB.')
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      'Only JPEG, JPG, PNG, and WebP formats are supported.'
    )
    .optional(),
  is_deleted: z.boolean().optional(),
});
