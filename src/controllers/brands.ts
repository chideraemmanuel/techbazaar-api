import { NextFunction, Request, Response } from 'express';
import validateSchema from '../lib/validate-schema';
import {
  addBrandSchema,
  brandUpdateSchema,
  getAllBrandsFilterSchema,
  getAvailableBrandsFilterSchema,
} from '../schemas/brands';
import z from 'zod';
import paginateQuery from '../lib/paginate-query';
import Brand from '../models/brand';
import mongoose from 'mongoose';
import HttpError from '../lib/http-error';
import { AuthorizedRequest } from '../middlewares/auth';
import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
} from 'firebase/storage';
import { app } from '../config/firebase';
import { v4 as uuid } from 'uuid';
import Product from '../models/product';

interface GetBrandsFilter {
  name?: { $regex: string; $options: 'i' };
  is_deleted?: boolean;
}

export const getAllBrands = async (
  request: AuthorizedRequest,
  response: Response,
  next: NextFunction
) => {
  try {
    const data = validateSchema<z.infer<typeof getAllBrandsFilterSchema>>(
      request.query,
      getAllBrandsFilterSchema
    );

    const {
      search_query,
      is_deleted,
      sort_by,
      sort_order,
      paginated,
      page,
      limit,
    } = data;

    const filter: GetBrandsFilter = {};

    if (search_query) {
      filter.name = { $regex: search_query, $options: 'i' };
    }

    if (is_deleted !== undefined) {
      filter.is_deleted = is_deleted;
    }

    if (paginated) {
      const paginationResult = await paginateQuery({
        model: Brand,
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
        select: '+is_deleted +deleted_at',
      });

      response.json(paginationResult);
      return;
    }

    const brands = await Brand.find(filter)
      .sort(sort_by && sort_order && { [sort_by]: sort_order })
      .select('+is_deleted +deleted_at')
      .lean();

    response.json(brands);
  } catch (error: any) {
    next(error);
  }
};

export const getAvailableBrands = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const data = validateSchema<z.infer<typeof getAvailableBrandsFilterSchema>>(
      request.query,
      getAvailableBrandsFilterSchema
    );

    const { search_query, sort_by, sort_order, paginated, page, limit } = data;

    const filter: GetBrandsFilter = {};

    if (search_query) {
      filter.name = { $regex: search_query, $options: 'i' };
    }

    if (paginated) {
      const paginationResult = await paginateQuery({
        model: Brand,
        filter: { ...filter, is_deleted: false },
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
      return;
    }

    const brands = await Brand.find(filter)
      .sort(sort_by && sort_order && { [sort_by]: sort_order })
      .lean();

    response.json(brands);
  } catch (error: any) {
    next(error);
  }
};

export const getAvailableBrandById = async (
  request: AuthorizedRequest,
  response: Response,
  next: NextFunction
) => {
  try {
    const { brandId } = request.params;

    if (!mongoose.isValidObjectId(brandId)) {
      throw new HttpError('Invalid brand ID', 400);
    }

    const brand = await Brand.findOne({
      _id: brandId,
      is_deleted: false,
    }).lean();

    if (!brand) {
      throw new HttpError('Brand with the provided ID does not exist', 404);
    }

    response.json(brand);
  } catch (error: any) {
    next(error);
  }
};

export const getBrandById = async (
  request: AuthorizedRequest,
  response: Response,
  next: NextFunction
) => {
  try {
    const { brandId } = request.params;

    if (!mongoose.isValidObjectId(brandId)) {
      throw new HttpError('Invalid brand ID', 400);
    }

    const brand = await Brand.findById(brandId).lean();

    if (!brand) {
      throw new HttpError('Brand with the provided ID does not exist', 404);
    }

    response.json(brand);
  } catch (error: any) {
    next(error);
  }
};

export const addBrand = async (
  request: AuthorizedRequest,
  response: Response,
  next: NextFunction
) => {
  try {
    const data = validateSchema<z.infer<typeof addBrandSchema>>(
      { ...request.body, logo: request.file },
      addBrandSchema
    );

    const { name, logo } = data;

    console.log('logooo', logo);

    const brandExists = await Brand.findOne({ name });

    if (brandExists) {
      throw new HttpError('Brand with the same name already exists', 400);
    }

    let logo_url: null | string = null;

    if (logo) {
      const storage = getStorage(app);
      const storageRef = ref(storage, `images/brands/${name} logo -${uuid()}`);
      const snapshot = await uploadBytes(storageRef, logo.buffer);
      const url = await getDownloadURL(snapshot.ref);

      logo_url = url;
    }

    const brand = await Brand.create({
      name,
      ...(logo && logo_url && { logo: logo_url }),
    });

    response
      .status(201)
      .json({ message: 'Brand added successfully', data: brand });
  } catch (error: any) {
    next(error);
  }
};

interface BrandUpdates {
  name?: string;
  logo?: string;
  is_deleted?: boolean;
  deleted_at?: Date | null;
}

export const updateBrand = async (
  request: AuthorizedRequest,
  response: Response,
  next: NextFunction
) => {
  try {
    const { brandId } = request.params;

    if (!mongoose.isValidObjectId(brandId)) {
      throw new HttpError('Invalid brand ID', 400);
    }

    const brand = await Brand.findById(brandId);

    if (!brand) {
      throw new HttpError('Brand with the supplied ID does not exist', 404);
    }

    const data = validateSchema<z.infer<typeof brandUpdateSchema>>(
      { ...request.body, logo: request.file },
      brandUpdateSchema
    );

    if (Object.keys(data).length === 0) {
      throw new HttpError('No field to be updated was supplied', 400);
    }

    const { name, logo } = data;

    const updates: BrandUpdates = {};

    if (name) {
      updates.name = name;
    }

    if (logo) {
      const storage = getStorage(app);
      const storageRef = ref(storage, `images/brands/${name} logo -${uuid()}`);
      const snapshot = await uploadBytes(storageRef, logo.buffer);
      const logo_url = await getDownloadURL(snapshot.ref);

      updates.logo = logo_url;
    }

    const updated_brand = await Brand.findByIdAndUpdate(brand._id, updates, {
      new: true,
    }).lean();

    // delete previous brand logo from firebase if new logo is uploaded
    if (logo && brand.logo) {
      const storage = getStorage(app);

      // Extract the file path from the full image URL
      const decodedUrl = decodeURIComponent(brand.logo);
      const filePath = decodedUrl.split('/o/')[1].split('?')[0];

      const previousBrandLogoRef = ref(storage, filePath);
      await deleteObject(previousBrandLogoRef);
    }

    response.json({
      message: 'Brand updated successfully',
      data: updated_brand,
    });
  } catch (error: any) {
    next(error);
  }
};

export const deleteBrand = async (
  request: AuthorizedRequest,
  response: Response,
  next: NextFunction
) => {
  try {
    const { brandId } = request.params;

    if (!mongoose.isValidObjectId(brandId)) {
      throw new HttpError('Invalid brand ID', 400);
    }

    const brand = await Brand.findById(brandId).select(
      '+is_deleted +deleted_at'
    );

    if (!brand) {
      throw new HttpError('Brand with the supplied ID does not exist', 404);
    }

    if (brand.is_deleted) {
      throw new HttpError('Brand has already been deleted', 422);
    }

    const productWithBrand = await Product.findOne({ brand: brand._id });

    if (productWithBrand) {
      brand.is_deleted = true;
      brand.deleted_at = new Date(Date.now());

      await brand.save();

      response.json({ message: 'Brand deleted successfully' });
      return;
    }

    await brand.deleteOne();

    if (brand.logo) {
      const storage = getStorage(app);

      // Extract the file path from the full image URL
      // const decodedUrl = decodeURIComponent(previous_logo_url);
      const decodedUrl = decodeURIComponent(brand.logo);
      const filePath = decodedUrl.split('/o/')[1].split('?')[0];

      const previousProductImageRef = ref(storage, filePath);
      await deleteObject(previousProductImageRef);
    }

    response.json({ message: 'Brand deleted successfully' });
  } catch (error: any) {
    next(error);
  }
};

export const restoreBrand = async (
  request: AuthorizedRequest,
  response: Response,
  next: NextFunction
) => {
  try {
    const { brandId } = request.params;

    if (!mongoose.isValidObjectId(brandId)) {
      throw new HttpError('Invalid brand ID', 400);
    }

    const brand = await Brand.findById(brandId).select(
      '+is_deleted +deleted_at'
    );

    if (!brand) {
      throw new HttpError(
        'Brand with the provided ID does not exist or has been permanently deleted',
        404
      );
    }

    if (!brand.is_deleted) {
      throw new HttpError('Brand was not previously deleted', 422);
    }

    brand.is_deleted = false;
    brand.deleted_at = null;

    await brand.save();

    response.json({ message: 'Brand restored successfully' });
  } catch (error: any) {
    next(error);
  }
};
