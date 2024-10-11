import mongoose from 'mongoose';
import z from 'zod';

export const getProductsFilterSchema = z
  .object({
    search_query: z
      .string()
      .min(1, 'Please specify a search string')
      .optional(),
    brand: z.string().min(1, 'Please supply a value for "brand"').optional(),
    price_range: z
      .string()
      .refine((value) => /^\d+-\d+$/.test(value), 'Invalid price range')
      .optional(),
    category: z
      .enum([
        'smartphones',
        'tablets',
        'laptops',
        'headphones',
        'speakers',
        'smartwatches',
        'gaming-consoles',
      ])
      .optional(),
    is_featured: z.enum(['true', 'false']).optional(),
    page: z
      .string()
      .refine((value) => /^\d$/.test(value), 'Page should be a numeric value')
      .optional(),
    limit: z
      .string()
      .refine((value) => /^\d$/.test(value), 'Limit should be a numeric value')
      .optional(),
    sort_by: z.enum(['name', 'price']).optional(),
    sort_order: z.enum(['ascending', 'descending']).optional(),
  })
  .refine((data) => !data.sort_by || data.sort_order, {
    path: ['sort_order'],
    message: 'Please specify a sorting order',
  });
