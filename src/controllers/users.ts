import { NextFunction, Request, Response } from 'express';
import { AuthenticatedRequest, AuthorizedRequest } from '../middlewares/auth';
import HttpError from '../lib/http-error';
import validateSchema from '../lib/validate-schema';
import {
  addItemToCartSchema,
  getCurrentUserCartFilterSchema,
  getCurrentUserOrdersFilterSchema,
  getUsersFilterSchema,
  updateCurrentUserSchema,
  updateUserStatusSchema,
} from '../schemas/user';
import z from 'zod';
import Cart from '../models/cart';
import Product from '../models/product';
import mongoose from 'mongoose';
import User, { UserAuthType, UserRole } from '../models/user';
import paginateQuery from '../lib/paginate-query';
import Order, { OrderStatus } from '../models/order';

interface GetUsersFilter {
  email_verified?: boolean;
  auth_type?: UserAuthType;
  role?: UserRole;
  disabled?: boolean;
}

export const getAllUsers = async (
  request: AuthorizedRequest,
  response: Response,
  next: NextFunction
) => {
  try {
    const user = request.user;

    if (!user || user.role !== 'admin') {
      // unlikely to be called, but in case
      throw new HttpError('Unauthorized access', 403);
    }

    const data = validateSchema<z.infer<typeof getUsersFilterSchema>>(
      request.query,
      getUsersFilterSchema
    );

    const {
      search_query,
      email_verified,
      auth_type,
      role,
      disabled,
      page,
      limit,
      sort_by,
      sort_order,
    } = data;

    const filter: GetUsersFilter = {};
    let search;

    if (search_query) {
      search = {
        $or: [
          { first_name: { $regex: search_query, $option: 'i' } },
          { last_name: { $regex: search_query, $option: 'i' } },
          { email: { $regex: search_query, $option: 'i' } },
        ],
      };
    }

    if (email_verified) {
      filter.email_verified = email_verified === 'true' ? true : false;
    }

    if (auth_type) {
      filter.auth_type = auth_type;
    }

    if (role) {
      filter.role = role;
    }

    if (disabled) {
      filter.disabled = disabled === 'true' ? true : false;
    }

    const paginationResult = await paginateQuery({
      model: User,
      filter: { ...search, ...filter },
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

export const getCurrentUser = async (
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

    response.json(user);
  } catch (error: any) {
    next(error);
  }
};

export const getUserById = async (
  request: AuthorizedRequest,
  response: Response,
  next: NextFunction
) => {
  try {
    const user = request.user;

    if (!user || user.role !== 'admin') {
      // unlikely to be called, but in case
      throw new HttpError('Unauthorized access', 403);
    }

    const { id } = request.params;

    if (!mongoose.isValidObjectId(id)) {
      throw new HttpError('Invalid user ID', 400);
    }

    const userExists = await User.findById(id).lean();

    if (!userExists) {
      throw new HttpError('User not found', 404);
    }

    response.json(userExists);
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

    if (!user || !user.email_verified) {
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

export const updateUserStatus = async (
  request: AuthorizedRequest,
  response: Response,
  next: NextFunction
) => {
  try {
    const user = request.user;

    if (!user || user.role !== 'admin') {
      // unlikely to be called, but in case
      throw new HttpError('Unauthorized access', 403);
    }

    const { id } = request.params;

    if (!mongoose.isValidObjectId(id)) {
      throw new HttpError('Invalid user ID', 400);
    }

    const userExists = await User.findById(id);

    if (!userExists) {
      throw new HttpError('User not found', 404);
    }

    const data = validateSchema<z.infer<typeof updateUserStatusSchema>>(
      request.body,
      updateUserStatusSchema
    );

    if (Object.keys(data).length === 0) {
      throw new HttpError('No field to be updated was supplied', 400);
    }

    const { role, disabled } = data;

    if (role) {
      // ? throw error if new role is the same as previous role..?
      userExists.role = role;
    }

    if (disabled) {
      // ? throw error if new disabled status is the same as previous disabled status..?
      userExists.disabled = disabled;
    }

    const updated_user = await userExists.save();

    response.json({
      message: 'User status updated successfully',
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

    if (!user || !user.email_verified) {
      // unlikely to be called, but in case
      throw new HttpError('Unauthorized access', 401);
    }

    const data = validateSchema<z.infer<typeof getCurrentUserCartFilterSchema>>(
      request.query,
      getCurrentUserCartFilterSchema
    );

    const { page, limit, sort_by, sort_order } = data;

    const paginationResult = await paginateQuery({
      model: Cart,
      filter: { user: user._id },
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

export const addItemToCart = async (
  request: AuthenticatedRequest,
  response: Response,
  next: NextFunction
) => {
  try {
    const user = request.user;

    if (!user || !user.email_verified) {
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
        422
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

    if (!user || !user.email_verified) {
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
        404
      );
    }

    await cart_item.deleteOne();

    response.json({ message: 'Item removed from cart successfully' });
  } catch (error: any) {
    next(error);
  }
};

export const incrementCartItemQuantity = async (
  request: AuthenticatedRequest,
  response: Response,
  next: NextFunction
) => {
  try {
    const user = request.user;

    if (!user || !user.email_verified) {
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
    // .populate('product');

    if (!cart_item) {
      throw new HttpError(
        `Cart item with the provided ID does not exist or has been removed from cart`,
        404
      );
    }

    // const product = await Product.findById(cart_item.product);

    // if (!product) {
    //   await cart_item.deleteOne();

    //   throw new HttpError(
    //     'Product with the provided ID does not exist or has been deleted',
    //     404
    //   );
    // }

    if (cart_item.product?.is_archived || cart_item.product?.stock === 0) {
      throw new HttpError(
        'Product with the provided ID is unavailable or out of stock',
        422
      );
    }

    if (cart_item.quantity === cart_item.product?.stock) {
      throw new HttpError(
        'Cart item quantity cannot exceed the number of items in stock',
        422
      );
    }

    cart_item.quantity += 1;
    const updated_cart_item = await cart_item.save();

    response.json({
      message: 'Item quantity incremented successfully',
      data: updated_cart_item,
    });
  } catch (error: any) {
    next(error);
  }
};

export const decrementCartItemQuantity = async (
  request: AuthenticatedRequest,
  response: Response,
  next: NextFunction
) => {
  try {
    const user = request.user;

    if (!user || !user.email_verified) {
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
    // .populate('product');

    if (!cart_item) {
      throw new HttpError(
        `Cart item with the provided ID does not exist or has been removed from cart`,
        400
      );
    }

    // const product = await Product.findById(cart_item.product);

    // if (!product) {
    //   await cart_item.deleteOne();

    //   throw new HttpError(
    //     'Product with the provided ID does not exist or has been deleted',
    //     404
    //   );
    // }

    if (cart_item.product?.is_archived || cart_item.product?.stock === 0) {
      throw new HttpError(
        'Product with the provided ID is unavailable or out of stock',
        400
      );
    }

    if (cart_item.quantity === 1) {
      await cart_item.deleteOne();

      response.json({
        message: 'Item quantity decremented successfully',
      });
    }

    cart_item.quantity -= 1;
    const updated_cart_item = await cart_item.save();

    response.json({
      message: 'Item quantity decremented successfully',
      data: updated_cart_item,
    });
  } catch (error: any) {
    next(error);
  }
};

export const clearCurrentUserCart = async (
  request: AuthenticatedRequest,
  response: Response,
  next: NextFunction
) => {
  try {
    const user = request.user;

    if (!user || !user.email_verified) {
      // unlikely to be called, but in case
      throw new HttpError('Unauthorized access', 401);
    }

    const delete_response = await Cart.deleteMany({ user: user._id });

    if (delete_response.deletedCount === 0) {
      throw new HttpError('No items in cart', 400);
    }

    response.json({ message: 'Cart cleared successfully' });
  } catch (error: any) {
    next(error);
  }
};

interface GetUserOrdersFilter {
  status?: OrderStatus;
}

export const getCurrentUserOrders = async (
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

    const data = validateSchema<
      z.infer<typeof getCurrentUserOrdersFilterSchema>
    >(request.query, getCurrentUserOrdersFilterSchema);

    const { status, page, limit, sort_by, sort_order } = data;

    const filter: GetUserOrdersFilter = {};

    if (status) {
      filter.status = status;
    }

    const paginationResult = await paginateQuery({
      model: Order,
      filter: { user: user._id, ...filter },
      page: +page,
      limit: +limit,
      sort_by: sort_by === 'date_created' ? 'createdAt' : sort_by,
      sort_order,
    });

    response.json(paginationResult);
  } catch (error: any) {
    next(error);
  }
};

export const getCurrentUserOrderById = async (
  request: AuthenticatedRequest,
  response: Response,
  next: NextFunction
) => {
  try {
    const user = request.user;

    if (!user || !user.email_verified) {
      // unlikely to be called, but in case
      throw new HttpError('Unauthorized access', 401);
    }

    const { orderId } = request.params;

    if (!mongoose.isValidObjectId(orderId)) {
      throw new HttpError('Invalid Order ID', 400);
    }

    const order = await Order.findById(orderId);

    if (!order) {
      throw new HttpError(
        'Order with the provided ID does not exist or has been cancelled',
        404
      );
    }

    response.json(order);
  } catch (error: any) {
    next(error);
  }
};
