import { PRODUCT_CATEGORIES_ARRAY } from 'lib/constants';
import mongoose from 'mongoose';
import z from 'zod';

export const getProductsFilterSchema = z
  .object({
    search_query: z
      .string()
      .min(1, 'Search query string cannot be empty')
      .optional(),
    brand: z.string().min(1, 'Product brand cannot be empty').optional(),
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
      .refine(
        (value) => PRODUCT_CATEGORIES_ARRAY.includes(value),
        'Invalid category'
      )
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
    message: `Sorting order isn't specified`,
  });

export const getRadomProductsFilterSchema = z
  .object({
    brand: z.string().min(1, 'Product brand cannot be empty').optional(),
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
      .refine(
        (value) => PRODUCT_CATEGORIES_ARRAY.includes(value),
        'Invalid category'
      )
      .optional(),
    is_featured: z.enum(['true', 'false']).optional(),
    limit: z
      .string()
      .refine((value) => /^\d$/.test(value), 'Limit should be a numeric value')
      .optional(),
    exclude: z
      .string()
      .refine(
        (value) => mongoose.isValidObjectId(value),
        'Invalid product ID passed to exclude'
      )
      .optional(),
    sort_by: z.enum(['name', 'price']).optional(),
    sort_order: z.enum(['ascending', 'descending']).optional(),
  })
  .refine((data) => !data.sort_by || data.sort_order, {
    path: ['sort_order'],
    message: `Sorting order isn't specified`,
  });

export const getRelatedProductsFilterSchema = z
  .object({
    price_range: z
      .string()
      .refine((value) => /^\d+-\d+$/.test(value), 'Invalid price range')
      .optional(),
    is_featured: z.enum(['true', 'false']).optional(),
    limit: z
      .string()
      .refine((value) => /^\d$/.test(value), 'Limit should be a numeric value')
      .optional(),
    sort_by: z.enum(['name', 'price']).optional(),
    sort_order: z.enum(['ascending', 'descending']).optional(),
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

export const addProductSchema = z.object({
  name: z
    .string({
      required_error: 'Product name is required',
    })
    .min(1, 'Product name cannot be empty'),
  brand: z
    .string({
      required_error: 'Product brand is required',
    })
    .min(1, 'Product brand cannot be empty'),
  description: z
    .string({
      required_error: 'Product description is required',
    })
    .min(1, 'Product description cannot be empty'),
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
    .refine(
      (value) => PRODUCT_CATEGORIES_ARRAY.includes(value),
      'Invalid category'
    ),
  image: z
    .instanceof(File)
    .refine((file) => file instanceof File, 'Image must be a file')
    .refine((file) => file.size <= MAX_FILE_SIZE, 'Max file size is 5MB.')
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      'Only JPEG, JPG, PNG, and WebP formats are supported.'
    ),
  price: z
    .number({
      required_error: 'Product price is required',
      invalid_type_error: 'Product price should be a numeric value',
    })
    .positive('Product price should be a positive numeric value'),
  stock: z
    .number({
      required_error: 'Stock is required',
      invalid_type_error: 'Stock should be a numeric value',
    })
    .positive('Stock should be a positive numeric value'),
  is_featured: z.enum(['true', 'false']).optional(),
  is_archived: z.enum(['true', 'false']).optional(),
});

export const productUpdateSchema = z.object({
  name: z.string().min(1, 'Product name cannot be empty').optional(),
  brand: z.string().min(1, 'Product brand cannot be empty').optional(),
  description: z
    .string()
    .min(1, 'Product description cannot be empty')
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
    .refine(
      (value) => PRODUCT_CATEGORIES_ARRAY.includes(value),
      'Invalid category'
    )
    .optional(),
  image: z
    .instanceof(File)
    .refine((file) => file instanceof File, 'Image must be a file')
    .refine((file) => file.size <= MAX_FILE_SIZE, 'Max file size is 5MB.')
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      'Only JPEG, JPG, PNG, and WebP formats are supported.'
    )
    .optional(),
  price: z
    .number({
      invalid_type_error: 'Product price should be a numeric value',
    })
    .positive('Product price should be a positive numeric value')
    .optional(),
  stock: z
    .number({
      invalid_type_error: 'Stock should be a numeric value',
    })
    .positive('Stock should be a positive numeric value')
    .optional(),
  // is_featured: z.enum(['true', 'false']).optional(),
  // is_archived: z.enum(['true', 'false']).optional(),
  is_featured: z.boolean().optional(),
  is_archived: z.boolean().optional(),
});
