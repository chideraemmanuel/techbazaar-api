import { NextFunction, Request, Response } from 'express';
import validateSchema from '../lib/validate-schema';
import {
  addProductSchema,
  getProductsFilterSchema,
  getRadomProductsFilterSchema,
  getRelatedProductsFilterSchema,
  productUpdateSchema,
} from '../schemas/product';
import z from 'zod';
import mongoose from 'mongoose';
import Product, { ProductCategory } from '../models/product';
import Brand from '../models/brand';
import HttpError from '../lib/http-error';
import paginateQuery from '../lib/paginate-query';
import { AuthorizedRequest } from '../middlewares/auth';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { app } from '../config/firebase';
import { v4 as uuid } from 'uuid';

interface GetProductsFilter {
  name?: { $regex: string; $options: 'i' };
  brand?: mongoose.Types.ObjectId;
  price?: {
    $gte: number;
    $lte: number;
  };
  category?: ProductCategory;
  is_featured?: boolean;
}

export const getAvailableProducts = async (
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
      filter: { ...filter, is_archived: false },
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

export const getRandomAvailableProducts = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const data = validateSchema<z.infer<typeof getRadomProductsFilterSchema>>(
      request.query,
      getRadomProductsFilterSchema
    );

    const {
      brand,
      price_range,
      category,
      is_featured,
      limit,
      exclude,
      sort_by,
      sort_order,
    } = data;

    const filter: GetProductsFilter = {};

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

    // set max limit to 50
    const limitNumber = !limit
      ? 20
      : +limit > 50
      ? 50
      : Math.ceil(+limit) <= 0
      ? 20
      : Math.ceil(+limit);

    const products = await Product.aggregate([
      {
        $match: {
          ...filter,
          is_archived: false,
          ...(exclude && { _id: { $ne: exclude } }),
        },
      },
      { $sample: { size: limitNumber } },
      sort_by &&
        sort_order && {
          $sort: { [sort_by]: sort_order === 'ascending' ? 1 : -1 },
        },
    ]);

    response.json(products);
  } catch (error: any) {
    next(error);
  }
};

export const getAllProducts = async (
  request: AuthorizedRequest,
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

export const getAvailableProductByIdOrSlug = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const { idOrSlug } = request.params;

    const isValidId = mongoose.isValidObjectId(idOrSlug);

    const product = isValidId
      ? await Product.findOne({ _id: idOrSlug, is_archived: false }).lean()
      : await Product.findOne({ slug: idOrSlug, is_archived: false }).lean();

    if (!product) {
      throw new HttpError('Product does not exist or is archived', 404);
    }

    response.json(product);
  } catch (error: any) {
    next(error);
  }
};

export const getProductByIdOrSlug = async (
  request: AuthorizedRequest,
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

export const getRelatedProducts = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const { idOrSlug } = request.params;

    const isValidId = mongoose.isValidObjectId(idOrSlug);

    const product = isValidId
      ? await Product.findOne({ _id: idOrSlug, is_archived: false }).lean()
      : await Product.findOne({ slug: idOrSlug, is_archived: false }).lean();

    if (!product) {
      throw new HttpError('Product does not exist or is archived', 404);
    }

    const data = validateSchema<z.infer<typeof getRelatedProductsFilterSchema>>(
      request.query,
      getRelatedProductsFilterSchema
    );

    const { price_range, is_featured, limit, sort_by, sort_order } = data;

    const filter: GetProductsFilter = {};

    if (price_range) {
      const [min_price, max_price] = price_range.split('-').map(Number);
      filter.price = { $gte: min_price, $lte: max_price };
    }

    if (is_featured) {
      filter.is_featured = is_featured === 'true' ? true : false;
    }

    // set max limit to 50
    const limitNumber = !limit
      ? 20
      : +limit > 50
      ? 50
      : Math.ceil(+limit) <= 0
      ? 20
      : Math.ceil(+limit);

    const products = await Product.aggregate([
      {
        $match: {
          ...filter,
          is_archived: false,
          _id: { $ne: product._id },
          $or: [{ brand: product.brand }, { category: product.category }],
        },
      },
      { $sample: { size: limitNumber } },
      sort_by &&
        sort_order && {
          $sort: { [sort_by]: sort_order === 'ascending' ? 1 : -1 },
        },
    ]);

    response.json(products);
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

export const updateProduct = async (
  request: AuthorizedRequest,
  response: Response,
  next: NextFunction
) => {
  try {
    const { idOrSlug } = request.params;

    const isValidId = mongoose.isValidObjectId(idOrSlug);

    const product = isValidId
      ? await Product.findById(idOrSlug)
      : await Product.findOne({ slug: idOrSlug });

    if (!product) {
      throw new HttpError('Product does not exist', 404);
    }

    const data = validateSchema<z.infer<typeof productUpdateSchema>>(
      request.body,
      productUpdateSchema
    );

    if (Object.keys(data).length === 0) {
      throw new HttpError('No field to be updated was supplied', 400);
    }

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

    if (name) {
      // ? throw error if new name is the same as previous name..?
      product.name = name;
    }

    if (brand) {
      const isBrandValidId = mongoose.isValidObjectId(brand);

      const brandExists = isBrandValidId
        ? await Brand.findById(brand).lean()
        : await Brand.findOne({ name: brand }).lean();

      if (!brandExists) {
        throw new HttpError('The specified brand does not exist', 404);
      }

      product.brand = brandExists._id as mongoose.Types.ObjectId;
    }

    if (description) {
      // ? throw error if new description is the same as previous description..?
      product.description = description;
    }

    if (category) {
      // ? throw error if new category is the same as previous category..?
      product.category = category;
    }

    // const previous_image_url = product.image;

    if (image) {
      const storage = getStorage(app);
      const storageRef = ref(
        storage,
        `images/products/${image.name}-${uuid()}`
      );
      const snapshot = await uploadBytes(storageRef, image);
      const image_url = await getDownloadURL(snapshot.ref);

      product.image = image_url;
    }

    if (price) {
      // ? throw error if new price is the same as previous price..?
      product.price = price;
    }

    if (stock) {
      // ? throw error if new stock is the same as previous stock..?
      product.stock = stock;
    }

    if (is_featured) {
      // ? throw error if new is_featured is the same as previous is_featured..?
      product.is_featured = is_featured === 'true' ? true : false;
    }

    if (is_archived) {
      // ? throw error if new is_archived is the same as previous is_archived..?
      product.is_archived = is_archived === 'true' ? true : false;
    }

    const updated_product = await product.save();

    // TODO: figure out how to persist previous logo url in a variable and delete here
    // // delete previous product image from firebase if new image is uploaded
    // if (image) {
    //   const storage = getStorage(app);

    //   // Extract the file path from the full image URL
    //   const decodedUrl = decodeURIComponent(previous_image_url);
    //   const filePath = decodedUrl.split('/o/')[1].split('?')[0];

    //   const previousProductImageRef = ref(storage, filePath);
    //   await deleteObject(previousProductImageRef);
    // }

    // const updated_product = await Product.findById(product._id).lean();

    response.json({
      message: 'Product updated successfully',
      data: updated_product,
    });
  } catch (error: any) {
    next(error);
  }
};

export const deleteProduct = async (
  request: AuthorizedRequest,
  response: Response,
  next: NextFunction
) => {
  try {
    const { idOrSlug } = request.params;

    const isValidId = mongoose.isValidObjectId(idOrSlug);

    const product = isValidId
      ? await Product.findById(idOrSlug)
      : await Product.findOne({ slug: idOrSlug });

    if (!product) {
      throw new HttpError('Product does not exist', 404);
    }

    // const previous_image_url = product.image;

    await product.deleteOne();

    const storage = getStorage(app);

    // Extract the file path from the full image URL
    // const decodedUrl = decodeURIComponent(previous_image_url);
    const decodedUrl = decodeURIComponent(product.image);
    const filePath = decodedUrl.split('/o/')[1].split('?')[0];

    const previousProductImageRef = ref(storage, filePath);
    await deleteObject(previousProductImageRef);

    response.json({ message: 'Product deleted successfully' });
  } catch (error: any) {
    next(error);
  }
};
// TODO: implement soft delete, or delete cart items that have deleted product
