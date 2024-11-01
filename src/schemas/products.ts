import { PRODUCT_CATEGORIES_ARRAY } from '../lib/constants';
import mongoose from 'mongoose';
import z from 'zod';
import {
  ACCEPTED_IMAGE_TYPES,
  booleanEnum,
  booleanSchema,
  MAX_FILE_SIZE,
  MAX_PRODUCT_PRICE,
  MAX_STOCK_COUNT,
  MULTER_FILE_SCHEMA,
  numberFilterchema,
  numberSchema,
  PRODUCT_CATEGORY_SCHEMA,
  SEARCH_QUERY_SCHEMA,
  SORT_ORDER_SCHEMA,
  stringFilterchema,
  stringSchema,
} from './constants';

export const getAvailableProductsFilterSchema = z
  .object({
    search_query: SEARCH_QUERY_SCHEMA.optional(),
    brand: stringFilterchema('brand').optional(),
    min_price: numberFilterchema('min_price').optional(),
    max_price: numberFilterchema('max_price').optional(),
    category: PRODUCT_CATEGORY_SCHEMA.optional(),
    is_featured: booleanEnum('is_featured').optional(),
    page: numberFilterchema('page').optional(),
    limit: numberFilterchema('limit').optional(),
    sort_by: z
      .enum(['name', 'price', 'date_created', 'date_updated'])
      .optional(),
    sort_order: SORT_ORDER_SCHEMA.optional(),
  })
  .refine(
    (data) => {
      if (data.min_price !== undefined && data.max_price !== undefined) {
        return data.min_price <= data.max_price;
      }
      return true; // Skip this check if one or both prices are missing
    },
    {
      message: 'min_price must be less than or equal to max_price.',
      path: ['max_price'], // Attach the error to the max_price field
    }
  )
  .refine((data) => !data.sort_by || data.sort_order, {
    path: ['sort_order'],
    message: `Sorting order isn't specified`,
  });

export const getAllProductsFilterSchema = z
  .object({
    search_query: SEARCH_QUERY_SCHEMA.optional(),
    brand: stringFilterchema('brand').optional(),
    min_price: numberFilterchema('min_price').optional(),
    max_price: numberFilterchema('max_price').optional(),
    category: PRODUCT_CATEGORY_SCHEMA.optional(),
    is_featured: booleanEnum('is_featured').optional(),
    is_archived: booleanEnum('is_archived').optional(),
    is_deleted: booleanEnum('is_deleted').optional(),
    page: numberFilterchema('page').optional(),
    limit: numberFilterchema('limit').optional(),
    sort_by: z
      .enum(['name', 'price', 'date_created', 'date_updated'])
      .optional(),
    sort_order: SORT_ORDER_SCHEMA.optional(),
  })
  .refine(
    (data) => {
      if (data.min_price !== undefined && data.max_price !== undefined) {
        return data.min_price <= data.max_price;
      }
      return true; // Skip this check if one or both prices are missing
    },
    {
      message: 'min_price must be less than or equal to max_price.',
      path: ['max_price'], // Attach the error to the max_price field
    }
  )
  .refine((data) => !data.sort_by || data.sort_order, {
    path: ['sort_order'],
    message: `Sorting order isn't specified`,
  });

export const getRadomProductsFilterSchema = z
  .object({
    brand: z.string().min(1, 'Product brand cannot be empty').optional(),
    min_price: numberFilterchema('min_price').optional(),
    max_price: numberFilterchema('max_price').optional(),
    category: PRODUCT_CATEGORY_SCHEMA.optional(),
    is_featured: booleanEnum('is_featured').optional(),
    limit: numberFilterchema('limit').optional(),
    exclude: z
      .string()
      .refine(
        (value) => mongoose.isValidObjectId(value),
        'Invalid product ID passed to exclude'
      )
      .optional(),
    sort_by: z
      .enum(['name', 'price', 'date_created', 'date_updated'])
      .optional(),
    sort_order: SORT_ORDER_SCHEMA.optional(),
  })
  .refine(
    (data) => {
      if (data.min_price !== undefined && data.max_price !== undefined) {
        return data.min_price <= data.max_price;
      }
      return true; // Skip this check if one or both prices are missing
    },
    {
      message: 'min_price must be less than or equal to max_price.',
      path: ['max_price'], // Attach the error to the max_price field
    }
  )
  .refine((data) => !data.sort_by || data.sort_order, {
    path: ['sort_order'],
    message: `Sorting order isn't specified`,
  });

export const getRelatedProductsFilterSchema = z
  .object({
    min_price: numberFilterchema('min_price').optional(),
    max_price: numberFilterchema('max_price').optional(),
    is_featured: booleanEnum('is_featured').optional(),
    limit: numberFilterchema('limit').optional(),
    sort_by: z
      .enum(['name', 'price', 'date_created', 'date_updated'])
      .optional(),
    sort_order: z.enum(['ascending', 'descending']).optional(),
  })
  .refine(
    (data) => {
      if (data.min_price !== undefined && data.max_price !== undefined) {
        return data.min_price <= data.max_price;
      }
      return true; // Skip this check if one or both prices are missing
    },
    {
      message: 'min_price must be less than or equal to max_price.',
      path: ['max_price'], // Attach the error to the max_price field
    }
  )
  .refine((data) => !data.sort_by || data.sort_order, {
    path: ['sort_order'],
    message: `Sorting order isn't specified`,
  });

export const addProductSchema = z.object({
  name: stringSchema('product name'),
  brand: stringSchema('product brand'),
  description: stringSchema('product description'),
  category: PRODUCT_CATEGORY_SCHEMA,
  image: MULTER_FILE_SCHEMA,
  price: stringSchema('product price', 1, MAX_PRODUCT_PRICE),
  stock: stringSchema('stock', 1, MAX_STOCK_COUNT),
  is_featured: booleanSchema('is_featured').optional(),
  is_archived: booleanSchema('is_archived').optional(),
});

export const productUpdateSchema = z.object({
  name: stringSchema('product name').optional(),
  brand: stringSchema('product brand').optional(),
  description: stringSchema('product description').optional(),
  category: PRODUCT_CATEGORY_SCHEMA.optional(),
  image: MULTER_FILE_SCHEMA.optional(),
  price: numberSchema('product price', 1, MAX_PRODUCT_PRICE).optional(),
  stock: numberSchema('stock', 1, MAX_STOCK_COUNT).optional(),
  // is_featured: z.enum(['true', 'false']).optional(),
  // is_archived: z.enum(['true', 'false']).optional(),
  is_featured: booleanSchema('is_featured').optional(),
  is_deleted: booleanSchema('is_deleted').optional(),
});
