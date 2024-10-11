import { NextFunction, Request, Response } from 'express';
import validateSchema from '../lib/validate-schema';
import { getProductsFilterSchema } from '../schemas/product';
import z from 'zod';
import mongoose from 'mongoose';
import Product, { ProductCategory } from '../models/product';
import Brand from '../models/brand';
import HttpError from '../lib/http-error';
import paginateQuery from '../lib/paginate-query';

interface GetProductsFilter {
  name?: any;
  brand?: string | mongoose.Types.ObjectId;
  price?: {
    $gte: number;
    $lte: number;
  };
  category?: ProductCategory;
  is_featured?: boolean;
}

export const getProducts = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const data = validateSchema<z.infer<typeof getProductsFilterSchema>>(
      request.query,
      getProductsFilterSchema
    );

    const {
      search_query,
      brand,
      price_range,
      category,
      is_featured,
      page,
      limit,
      sort_by,
      sort_order,
    } = data;

    const filter: GetProductsFilter = {};

    if (search_query) {
      filter.name = { $regex: search_query, $options: 'i' };
    }

    if (brand) {
      const isValidId = mongoose.isValidObjectId(brand);

      const brandExists = isValidId
        ? await Brand.findById(brand)
        : await Brand.findOne({ name: brand });

      if (!brandExists) {
        throw new HttpError('The selected brand does not exist', 404);
      }

      filter.brand = brandExists._id as mongoose.Types.ObjectId;
    }

    if (price_range) {
      const [min_price, max_price] = price_range.split('-').map(Number);
      filter.price = { $gte: min_price, $lte: max_price };
    }

    if (category) {
      filter.category = category;
    }

    // if (is_featured !== undefined) {
    //   filter.is_featured = is_featured;
    // }

    if (is_featured) {
      filter.is_featured = is_featured === 'true' ? true : false;
    }

    const paginationResult = await paginateQuery({
      model: Product,
      filter,
      page: +page,
      limit: +limit,
      sort_by,
      sort_order,
    });

    response.json(paginationResult);
  } catch (error: any) {
    next(error);
  }
};
