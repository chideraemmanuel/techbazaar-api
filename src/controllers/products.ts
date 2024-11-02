import { NextFunction, Request, Response } from 'express';
import validateSchema from '../lib/validate-schema';
import {
  addProductSchema,
  getAllProductsFilterSchema,
  getAvailableProductsFilterSchema,
  getRadomProductsFilterSchema,
  getRelatedProductsFilterSchema,
  productUpdateSchema,
} from '../schemas/products';
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
import Cart from '../models/cart';
import Order from '../models/order';

interface GetProductsFilter {
  name?: { $regex: string; $options: 'i' };
  brand?: mongoose.Types.ObjectId;
  price?: {
    $gte?: number;
    $lte?: number;
  };
  category?: ProductCategory;
  is_featured?: boolean;
  is_archived?: boolean;
  is_deleted?: boolean;
}

export const getAvailableProducts = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const data = validateSchema<
      z.infer<typeof getAvailableProductsFilterSchema>
    >(request.query, getAvailableProductsFilterSchema);

    const {
      search_query,
      brand,
      min_price,
      max_price,
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

    if (min_price && max_price) {
      filter.price = { $gte: min_price, $lte: max_price };
    } else if (min_price) {
      filter.price = { $gte: min_price };
    } else if (max_price) {
      filter.price = { $lte: max_price };
    }

    if (category) {
      filter.category = category;
    }

    if (is_featured) {
      filter.is_featured = is_featured;
    }

    const paginationResult = await paginateQuery({
      model: Product,
      filter: { ...filter, is_archived: false, is_deleted: false },
      page: +page,
      limit: +limit,
      sort_by:
        sort_by === 'date_created'
          ? 'createdAt'
          : sort_by === 'date_updated'
          ? 'updatedAt'
          : sort_by,
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
      min_price,
      max_price,
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

    if (min_price && max_price) {
      filter.price = { $gte: min_price, $lte: max_price };
    } else if (min_price) {
      filter.price = { $gte: min_price };
    } else if (max_price) {
      filter.price = { $lte: max_price };
    }

    if (category) {
      filter.category = category;
    }

    if (is_featured) {
      filter.is_featured = is_featured;
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
          is_deleted: false,
          ...(exclude && { _id: { $ne: exclude } }),
        },
      },
      { $sample: { size: limitNumber } },
      sort_by &&
        sort_order && {
          $sort: {
            [sort_by === 'date_created'
              ? 'createdAt'
              : sort_by === 'date_updated'
              ? 'updatedAt'
              : sort_by]: sort_order === 'ascending' ? 1 : -1,
          },
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
    const data = validateSchema<z.infer<typeof getAllProductsFilterSchema>>(
      request.query,
      getAllProductsFilterSchema
    );

    const {
      search_query,
      brand,
      min_price,
      max_price,
      category,
      is_featured,
      is_archived,
      is_deleted,
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

    if (min_price && max_price) {
      filter.price = { $gte: min_price, $lte: max_price };
    } else if (min_price) {
      filter.price = { $gte: min_price };
    } else if (max_price) {
      filter.price = { $lte: max_price };
    }

    if (category) {
      filter.category = category;
    }

    if (is_featured) {
      filter.is_featured = is_featured;
    }

    if (is_archived) {
      filter.is_archived = is_archived;
    }

    if (is_deleted) {
      filter.is_deleted = is_deleted;
    }

    const paginationResult = await paginateQuery({
      model: Product,
      filter,
      page: +page,
      limit: +limit,
      sort_by:
        sort_by === 'date_created'
          ? 'createdAt'
          : sort_by === 'date_updated'
          ? 'updatedAt'
          : sort_by,
      sort_order,
      select: '+is_archived +is_deleted +deleted_at',
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
      ? await Product.findOne({
          _id: idOrSlug,
          is_archived: false,
          is_deleted: false,
        }).lean()
      : await Product.findOne({
          slug: idOrSlug,
          is_archived: false,
          is_deleted: false,
        }).lean();

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
      ? await Product.findOne({
          _id: idOrSlug,
          is_archived: false,
          is_deleted: false,
        }).lean()
      : await Product.findOne({
          slug: idOrSlug,
          is_archived: false,
          is_deleted: false,
        }).lean();

    if (!product) {
      throw new HttpError('Product does not exist or is archived', 404);
    }

    const data = validateSchema<z.infer<typeof getRelatedProductsFilterSchema>>(
      request.query,
      getRelatedProductsFilterSchema
    );

    const { min_price, max_price, is_featured, limit, sort_by, sort_order } =
      data;

    const filter: GetProductsFilter = {};

    if (min_price && max_price) {
      filter.price = { $gte: min_price, $lte: max_price };
    } else if (min_price) {
      filter.price = { $gte: min_price };
    } else if (max_price) {
      filter.price = { $lte: max_price };
    }

    if (is_featured) {
      filter.is_featured = is_featured;
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
          is_deleted: false,
          _id: { $ne: product._id },
          $or: [{ brand: product.brand }, { category: product.category }],
        },
      },
      { $sample: { size: limitNumber } },
      sort_by &&
        sort_order && {
          $sort: {
            [sort_by === 'date_created'
              ? 'createdAt'
              : sort_by === 'date_updated'
              ? 'updatedAt'
              : sort_by]: sort_order === 'ascending' ? 1 : -1,
          },
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
      { ...request.body, image: request.file },
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
    } = data;

    const isBrandValidId = mongoose.isValidObjectId(brand);

    const brandExists = isBrandValidId
      ? await Brand.findById(brand).lean()
      : await Brand.findOne({ name: brand }).lean();

    if (!brandExists) {
      throw new HttpError('The specified brand does not exist', 404);
    }

    const storage = getStorage(app);
    const storageRef = ref(storage, `images/products/${name} image -${uuid()}`);
    const snapshot = await uploadBytes(storageRef, image.buffer);
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
    });

    response
      .status(201)
      .json({ message: 'Product added successfully', data: product });
  } catch (error: any) {
    next(error);
  }
};

interface ProductUpdates {
  name?: string;
  brand?: mongoose.Types.ObjectId;
  description?: string;
  category?: ProductCategory;
  image?: string;
  price?: number;
  stock?: number;
  is_archived?: boolean;
  is_featured?: boolean;
}

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
      { ...request.body, image: request.file },
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
    } = data;

    const updates: ProductUpdates = {};

    if (name) {
      updates.name = name;
    }

    if (brand) {
      const isBrandValidId = mongoose.isValidObjectId(brand);

      const brandExists = isBrandValidId
        ? await Brand.findById(brand).lean()
        : await Brand.findOne({ name: brand }).lean();

      if (!brandExists) {
        throw new HttpError('The specified brand does not exist', 404);
      }

      updates.brand = brandExists._id as mongoose.Types.ObjectId;
    }

    if (description) {
      updates.description = description;
    }

    if (category) {
      updates.category = category;
    }

    if (image) {
      const storage = getStorage(app);
      const storageRef = ref(
        storage,
        `images/products/${name || product.name} logo -${uuid()}`
      );
      const snapshot = await uploadBytes(storageRef, image.buffer);
      const image_url = await getDownloadURL(snapshot.ref);

      updates.image = image_url;
    }

    if (price) {
      updates.price = price;
    }

    if (stock !== undefined) {
      console.log('stockkk', stock);
      if (stock === 0) {
        updates.is_archived = true;
      } else {
        updates.is_archived = false;
      }

      updates.stock = stock;
    }

    if (is_featured !== undefined) {
      updates.is_featured = is_featured;
    }

    const updated_product = await Product.findByIdAndUpdate(
      product._id,
      updates,
      { new: true }
    ).lean();

    // delete previous product image from firebase if new image is uploaded
    if (image && product.image) {
      const storage = getStorage(app);

      // Extract the file path from the full image URL
      const decodedUrl = decodeURIComponent(product.image);
      const filePath = decodedUrl.split('/o/')[1].split('?')[0];

      const previousProductImageRef = ref(storage, filePath);
      await deleteObject(previousProductImageRef);
    }

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

    if (product.is_deleted) {
      throw new HttpError('Product has already been deleted', 422);
    }

    // TODO: implement this..?
    // const cartWithProduct = await Cart.findOne({ product: product._id })
    // const orderWithProduct = await Order.findOne({ product: product._id })

    // if (cartWithProduct || orderWithProduct) {
    //   product.is_deleted = true

    //   await product.save()
    // }

    // await product.deleteOne();

    // const storage = getStorage(app);

    // // Extract the file path from the full image URL
    // const decodedUrl = decodeURIComponent(product.image);
    // const filePath = decodedUrl.split('/o/')[1].split('?')[0];

    // const previousProductImageRef = ref(storage, filePath);
    // await deleteObject(previousProductImageRef);

    // response.json({ message: 'Product deleted successfully' });

    product.is_deleted = true;
    product.deleted_at = new Date(Date.now());

    await product.save();

    response.json({ message: 'Product deleted successfully' });
  } catch (error: any) {
    next(error);
  }
};

export const restoreProduct = async (
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
      throw new HttpError(
        'Product does not exist or has been permanently deleted',
        404
      );
    }

    if (!product.is_deleted) {
      throw new HttpError('Product was not previously deleted', 422);
    }

    product.is_deleted = false;
    // product.deleted_at = null;
    delete product.deleted_at;

    await product.save();

    response.json({ message: 'Product restored successfully' });
  } catch (error: any) {
    next(error);
  }
};
