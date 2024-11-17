import mongoose from 'mongoose';
import z from 'zod';
import {
  booleanEnum,
  booleanUnion,
  MAX_PRODUCT_PRICE,
  MAX_STOCK_COUNT,
  MULTER_FILE_SCHEMA,
  numberFilterSchema,
  numberUnion,
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
    min_price: numberFilterSchema('min_price').optional(),
    max_price: numberFilterSchema('max_price').optional(),
    category: PRODUCT_CATEGORY_SCHEMA.optional(),
    is_featured: booleanEnum('is_featured').optional(),
    page: numberFilterSchema('page').optional(),
    limit: numberFilterSchema('limit').optional(),
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
    min_price: numberFilterSchema('min_price').optional(),
    max_price: numberFilterSchema('max_price').optional(),
    category: PRODUCT_CATEGORY_SCHEMA.optional(),
    is_featured: booleanEnum('is_featured').optional(),
    is_archived: booleanEnum('is_archived').optional(),
    is_deleted: booleanEnum('is_deleted').optional(),
    page: numberFilterSchema('page').optional(),
    limit: numberFilterSchema('limit').optional(),
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
    min_price: numberFilterSchema('min_price').optional(),
    max_price: numberFilterSchema('max_price').optional(),
    category: PRODUCT_CATEGORY_SCHEMA.optional(),
    is_featured: booleanEnum('is_featured').optional(),
    limit: numberFilterSchema('limit').optional(),
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
    min_price: numberFilterSchema('min_price').optional(),
    max_price: numberFilterSchema('max_price').optional(),
    is_featured: booleanEnum('is_featured').optional(),
    limit: numberFilterSchema('limit').optional(),
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
  description: stringSchema('product description', 1, 1000),
  category: PRODUCT_CATEGORY_SCHEMA,
  image: MULTER_FILE_SCHEMA,
  price: numberUnion('product price', 1, MAX_PRODUCT_PRICE).optional(),
  stock: numberUnion('stock', 1, MAX_STOCK_COUNT).optional(),
  is_featured: booleanUnion('is_featured').optional(),
});

export const productUpdateSchema = z.object({
  name: stringSchema('product name').optional(),
  brand: stringSchema('product brand').optional(),
  description: stringSchema('product description', 1, 1000).optional(),
  category: PRODUCT_CATEGORY_SCHEMA.optional(),
  image: MULTER_FILE_SCHEMA.optional(),
  price: numberUnion('product price', 1, MAX_PRODUCT_PRICE).optional(),
  stock: numberUnion('stock', 0, MAX_STOCK_COUNT).optional(),
  is_featured: booleanUnion('is_featured').optional(),
});
