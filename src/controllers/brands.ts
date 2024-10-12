import { NextFunction, Request, Response } from 'express';
import validateSchema from '../lib/validate-schema';
import {
  addBrandSchema,
  brandUpdateSchema,
  getBrandsFilterSchema,
} from '../schemas/brand';
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

interface GetBrandsFilter {
  name?: { $regex: string; $options: 'i' };
}

export const getBrands = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const data = validateSchema<z.infer<typeof getBrandsFilterSchema>>(
      request.query,
      getBrandsFilterSchema
    );

    const { search_query, sort_by, sort_order, paginated, page, limit } = data;

    const filter: GetBrandsFilter = {};

    if (search_query) {
      filter.name = { $regex: search_query, $options: 'i' };
    }

    if (paginated) {
      const paginationResult = await paginateQuery({
        model: Brand,
        filter,
        page: +page,
        limit: +limit,
        sort_by,
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

export const getBrandById = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const { id } = request.params;

    if (!mongoose.isValidObjectId(id)) {
      throw new HttpError('Invalid brand ID', 400);
    }

    const brand = await Brand.findById(id).lean();

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
      request.body,
      addBrandSchema
    );

    const { name, logo } = data;

    const brandExists = await Brand.findOne({ name });

    if (brandExists) {
      throw new HttpError('Brand with the same name already exists', 400);
    }

    let logo_url: null | string = null;

    if (logo) {
      const storage = getStorage(app);
      const storageRef = ref(storage, `images/brands/${logo.name}-${uuid()}`);
      const snapshot = await uploadBytes(storageRef, logo);
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

export const updateBrand = async (
  request: AuthorizedRequest,
  response: Response,
  next: NextFunction
) => {
  try {
    const { id } = request.params;

    if (!mongoose.isValidObjectId(id)) {
      throw new HttpError('Invalid brand ID', 400);
    }

    const brand = await Brand.findById(id);

    if (!brand) {
      throw new HttpError('Brand with the supplied ID does not exist', 404);
    }

    const data = validateSchema<z.infer<typeof brandUpdateSchema>>(
      request.body,
      brandUpdateSchema
    );

    if (Object.keys(data).length === 0) {
      throw new HttpError('No field to be updated was supplied', 400);
    }

    const { name, logo } = data;

    if (name) {
      // ? throw error if new name is the same as previous name..?
      brand.name = name;
    }

    if (logo) {
      const storage = getStorage(app);
      const storageRef = ref(storage, `images/brands/${logo.name}-${uuid()}`);
      const snapshot = await uploadBytes(storageRef, logo);
      const logo_url = await getDownloadURL(snapshot.ref);

      brand.logo = logo_url;
    }

    const updated_brand = await brand.save();

    console.log('brand after update', brand);

    // TODO: figure out how to persist previous logo url in a variable and delete here
    // // delete previous brand logo from firebase if new logo is uploaded
    // if (brand.logo && logo) {
    //   const storage = getStorage(app);

    //   // Extract the file path from the full image URL
    //     const decodedUrl = decodeURIComponent(previous_logo_url);
    //   // const decodedUrl = decodeURIComponent(brand.logo);
    //   const filePath = decodedUrl.split('/o/')[1].split('?')[0];

    //   const previousBrandLogoRef = ref(storage, filePath);
    //   await deleteObject(previousBrandLogoRef);
    // }

    // const updated_brand = await Brand.findById(brand._id).lean();

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
    const { id } = request.params;

    if (!mongoose.isValidObjectId(id)) {
      throw new HttpError('Invalid brand ID', 400);
    }

    const brand = await Brand.findById(id);

    if (!brand) {
      throw new HttpError('Brand with the supplied ID does not exist', 404);
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
// ? TODO: delete products that have deleted brand
// TODO: update brand to null on products that have the deleted brands
