import { NextFunction, Request, Response } from 'express';
import { AuthenticatedRequest, AuthorizedRequest } from '../middlewares/auth';
import HttpError from '../lib/http-error';
import validateSchema from '../lib/validate-schema';
import { addItemToCartSchema, updateCurrentUserSchema } from '../schemas/user';
import z from 'zod';
import Cart from '../models/cart';
import Product from '../models/product';
import mongoose from 'mongoose';

export const getAllUsers = async (
  request: AuthorizedRequest,
  response: Response,
  next: NextFunction
) => {
  try {
    response.json({ message: 'Get all users!' });
  } catch (error: any) {
    next(error);
  }
};

export const getCurrentUser = async (
  request: AuthenticatedRequest,
  response: Response,
  next: NextFunction
) => {
  try {
    const user = request.user;
    response.json(user);
  } catch (error: any) {
    next(error);
  }
};

export const updateCurrentUser = async (
  request: AuthenticatedRequest,
  response: Response,
  next: NextFunction
) => {
  try {
    const user = request.user;

    if (!user) {
      // unlikely to be called, but in case
      throw new HttpError('Unauthorized access', 401);
    }

    const data = validateSchema<z.infer<typeof updateCurrentUserSchema>>(
      request.body,
      updateCurrentUserSchema
    );

    if (Object.keys(data).length === 0) {
      throw new HttpError('No field to be updated was supplied', 400);
    }

    const { first_name, last_name, password } = data;

    if (first_name) {
      // ? throw error if new first_name is the same as previous first_name..?
      user.first_name = first_name;
    }

    if (last_name) {
      // ? throw error if new last_name is the same as previous last_name..?
      user.last_name = last_name;
    }

    if (password) {
      // ? throw error if new password is the same as previous password..?
      user.password = password;
    }

    const updated_user = await user.save();

    response.json({
      message: 'User profile updated successfully',
      data: updated_user,
    });
  } catch (error: any) {
    next(error);
  }
};

export const getCurrentUserCart = async (
  request: AuthenticatedRequest,
  response: Response,
  next: NextFunction
) => {
  try {
    const user = request.user;

    if (!user) {
      // unlikely to be called, but in case
      throw new HttpError('Unauthorized access', 401);
    }

    const cart = await Cart.find({ user: user._id }).lean();

    response.json(cart);
  } catch (error: any) {
    next(error);
  }
};

export const addItemToCart = async (
  request: AuthenticatedRequest,
  response: Response,
  next: NextFunction
) => {
  try {
    const user = request.user;

    if (!user) {
      // unlikely to be called, but in case
      throw new HttpError('Unauthorized access', 401);
    }

    const data = validateSchema<z.infer<typeof addItemToCartSchema>>(
      request.body,
      addItemToCartSchema
    );

    const { product: product_id } = data;

    const product = await Product.findById(product_id);

    if (!product) {
      throw new HttpError(
        'Product with the provided ID does not exist or has been deleted',
        404
      );
    }

    if (product.is_archived || product.stock === 0) {
      throw new HttpError(
        'Product with the provided ID is unavailable or out of stock',
        400
      );
    }

    const itemAlreadyInCart = await Cart.findOne({
      user: user._id,
      product: product_id,
    });

    if (itemAlreadyInCart) {
      throw new HttpError('Item is already in cart', 400);
    }

    const new_cart_item = await Cart.create({
      user: user._id,
      product,
      quantity: 1,
    });

    response.json({
      message: 'Item added to cart successfully',
      data: new_cart_item,
    });
  } catch (error: any) {
    next(error);
  }
};

export const removeItemFromCart = async (
  request: AuthenticatedRequest,
  response: Response,
  next: NextFunction
) => {
  try {
    const user = request.user;

    if (!user) {
      // unlikely to be called, but in case
      throw new HttpError('Unauthorized access', 401);
    }

    const { cartItemId } = request.params;

    if (!mongoose.isValidObjectId(cartItemId)) {
      throw new HttpError('Invalid cart item ID', 400);
    }

    const cart_item = await Cart.findOne({
      _id: cartItemId,
      user: user._id,
    });

    if (!cart_item) {
      throw new HttpError(
        `Cart item with the provided ID does not exist or has been removed from cart`,
        400
      );
    }

    await cart_item.deleteOne();

    response.json({ message: 'Item removed from cart successfully' });
  } catch (error: any) {
    next(error);
  }
};
