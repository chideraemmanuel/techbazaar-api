import { NextFunction, Request, Response } from 'express';
import validateSchema from '../lib/validate-schema';
import { addProductSchema, getProductsFilterSchema } from '../schemas/product';
import z from 'zod';
import mongoose from 'mongoose';
import Product, { ProductCategory } from '../models/product';
import Brand from '../models/brand';
import HttpError from '../lib/http-error';
import paginateQuery from '../lib/paginate-query';
import { AuthorizedRequest } from 'middlewares/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app } from '../config/firebase';
import { v4 as uuid } from 'uuid';

interface GetProductsFilter {
  name?: { $regex: string; $options: 'i' };
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
        throw new HttpError('The specified brand does not exist', 404);
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

export const getProductByIdOrSlug = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const { idOrSlug } = request.params;

    const isValidId = mongoose.isValidObjectId(idOrSlug);

    const product = isValidId
      ? await Product.findById(idOrSlug).lean()
      : await Product.findOne({ slug: idOrSlug }).lean();

    if (!product) {
      throw new HttpError('Product does not exist', 404);
    }

    response.json(product);
  } catch (error: any) {
    next(error);
  }
};

export const addProduct = async (
  request: AuthorizedRequest,
  response: Response,
  next: NextFunction
) => {
  try {
    const data = validateSchema<z.infer<typeof addProductSchema>>(
      request.body,
      addProductSchema
    );

    const {
      name,
      brand,
      description,
      category,
      image,
      price,
      stock,
      is_featured,
      is_archived,
    } = data;

    const isBrandValidId = mongoose.isValidObjectId(brand);

    const brandExists = isBrandValidId
      ? await Brand.findById(brand).lean()
      : await Brand.findOne({ name: brand }).lean();

    if (!brandExists) {
      throw new HttpError('The specified brand does not exist', 404);
    }

    const storage = getStorage(app);
    const storageRef = ref(storage, `images/products/${image.name}-${uuid()}`);
    const snapshot = await uploadBytes(storageRef, image);
    const image_url = await getDownloadURL(snapshot.ref);

    const product = await Product.create({
      name,
      brand: brandExists._id,
      description,
      category,
      image: image_url,
      price,
      stock,
      is_featured: is_featured ? is_featured : undefined,
      is_archived: is_archived ? is_archived : undefined,
    });

    response
      .status(201)
      .json({ message: 'Product added successfully', data: product });
  } catch (error: any) {
    next(error);
  }
};
