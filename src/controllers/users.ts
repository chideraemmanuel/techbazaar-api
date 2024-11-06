import { NextFunction, Request, Response } from 'express';
import { AuthenticatedRequest, AuthorizedRequest } from '../middlewares/auth';
import HttpError from '../lib/http-error';
import validateSchema from '../lib/validate-schema';
import {
  addItemToCartSchema,
  getCurrentUserCartFilterSchema,
  getUserOrdersFilterSchema,
  getUsersFilterSchema,
  placeOrderSchema,
  updateCurrentUserSchema,
  updateUserStatusSchema,
} from '../schemas/users';
import z from 'zod';
import Cart from '../models/cart';
import Product from '../models/product';
import mongoose, { PipelineStage } from 'mongoose';
import User, { UserAuthType, UserRole } from '../models/user';
import paginateQuery from '../lib/paginate-query';
import Order, {
  OrderBillingInformation,
  OrderItem,
  OrderStatus,
  PopulatedOrderItem,
} from '../models/order';
import calculateSubTotal from '../lib/calculateSubTotal';
import { read } from 'fs';
import BillingInformation from '../models/billing-information';

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

    if (email_verified !== undefined) {
      filter.email_verified = email_verified;
    }

    if (auth_type) {
      filter.auth_type = auth_type;
    }

    if (role) {
      filter.role = role;
    }

    if (disabled !== undefined) {
      filter.disabled = disabled;
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
    const { userId } = request.params;

    if (!mongoose.isValidObjectId(userId)) {
      throw new HttpError('Invalid user ID', 400);
    }

    const user = await User.findById(userId).lean();

    if (!user) {
      throw new HttpError('User not found', 404);
    }

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

    const data = validateSchema<z.infer<typeof updateCurrentUserSchema>>(
      request.body,
      updateCurrentUserSchema
    );

    if (Object.keys(data).length === 0) {
      throw new HttpError('No field to be updated was supplied', 400);
    }

    const { first_name, last_name, password } = data;

    if (first_name) {
      user.first_name = first_name;
    }

    if (last_name) {
      user.last_name = last_name;
    }

    if (password) {
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
    const { userId } = request.params;

    if (!mongoose.isValidObjectId(userId)) {
      throw new HttpError('Invalid user ID', 400);
    }

    const user = await User.findById(userId);

    if (!user) {
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
      user.role = role;
    }

    if (disabled) {
      user.disabled = disabled;
    }

    const updated_user = await user.save();

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

export const getCurrentUserCartSummary = async (
  request: AuthenticatedRequest,
  response: Response,
  next: NextFunction
) => {
  try {
    const user = request.user;

    //  total number of items
    //  total price

    const pipeline: PipelineStage[] = [
      // Match the documents belonging to the given user
      { $match: { user: user._id } },

      // Lookup the product details to join with the cart
      {
        $lookup: {
          from: 'products', // Make sure the collection name matches your MongoDB naming
          localField: 'product',
          foreignField: '_id',
          as: 'productDetails',
        },
      },

      // Unwind the productDetails array to deconstruct it
      { $unwind: '$productDetails' },

      // Add fields to calculate the total for each item (quantity * price)
      {
        $addFields: {
          totalAmountPerItem: {
            $multiply: ['$quantity', '$productDetails.price'],
          },
        },
      },

      // Group by null to calculate the overall totals
      {
        $group: {
          _id: null,
          total_items: { $sum: '$quantity' },
          total_amount: { $sum: '$totalAmountPerItem' },
        },
      },

      // Project the final structure without _id
      {
        $project: {
          _id: 0,
          total_items: 1,
          total_amount: 1,
        },
      },
    ];

    const aggregationResult = await Cart.aggregate(pipeline);

    const cart_summary =
      aggregationResult.length > 0
        ? aggregationResult[0]
        : { total_items: 0, total_amount: 0 };

    response.json(cart_summary);
  } catch (error: any) {
    next(error);
  }
};

export const getCartItemByProductID = async (
  request: AuthenticatedRequest,
  response: Response,
  next: NextFunction
) => {
  try {
    const { id } = request.query;

    if (!id)
      throw new HttpError('Product ID is missing in query parameters.', 400);

    if (!mongoose.isValidObjectId(id))
      throw new HttpError('Invalid product ID', 400);

    const cart_item = await Cart.findOne({ product: id });

    if (!cart_item) {
      // throw new HttpError('', 422);
      response.status(204).json(null);
      return;
    }

    response.json(cart_item);
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

    response.status(201).json({
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
  createdAt?: {
    $gte?: Date;
    $lte?: Date;
  };
}

export const getCurrentUserOrders = async (
  request: AuthenticatedRequest,
  response: Response,
  next: NextFunction
) => {
  try {
    const user = request.user;

    const data = validateSchema<z.infer<typeof getUserOrdersFilterSchema>>(
      request.query,
      getUserOrdersFilterSchema
    );

    const { status, start_date, end_date, page, limit, sort_by, sort_order } =
      data;

    const filter: GetUserOrdersFilter = {};

    if (status) {
      filter.status = status;
    }

    if (start_date) {
      filter.createdAt = { $gte: new Date(start_date) };
    }

    if (end_date) {
      filter.createdAt = {
        ...filter.createdAt,
        $lte: new Date(end_date),
      };
    }

    const paginationResult = await paginateQuery({
      model: Order,
      filter: { user: user._id, ...filter },
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

export const getUserOrders = async (
  request: AuthorizedRequest,
  response: Response,
  next: NextFunction
) => {
  try {
    const { userId } = request.params;

    if (!mongoose.isValidObjectId(userId)) {
      throw new HttpError('Invalid user ID', 400);
    }

    const user = await User.findById(userId).lean();

    if (!user) {
      throw new HttpError('User not found', 404);
    }

    const data = validateSchema<z.infer<typeof getUserOrdersFilterSchema>>(
      request.query,
      getUserOrdersFilterSchema
    );

    const { status, start_date, end_date, page, limit, sort_by, sort_order } =
      data;

    const filter: GetUserOrdersFilter = {};

    if (status) {
      filter.status = status;
    }

    if (start_date) {
      filter.createdAt = { $gte: new Date(start_date) };
    }

    if (end_date) {
      filter.createdAt = {
        ...filter.createdAt,
        $lte: new Date(end_date),
      };
    }

    const paginationResult = await paginateQuery({
      model: Order,
      filter: { user: user._id, ...filter },
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

export const getCurrentUserOrderById = async (
  request: AuthenticatedRequest,
  response: Response,
  next: NextFunction
) => {
  try {
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

export const getUserOrderById = async (
  request: AuthorizedRequest,
  response: Response,
  next: NextFunction
) => {
  try {
    const { userId, orderId } = request.params;

    if (!mongoose.isValidObjectId(userId)) {
      throw new HttpError('Invalid user ID', 400);
    }

    if (!mongoose.isValidObjectId(orderId)) {
      throw new HttpError('Invalid order ID', 400);
    }

    const user = await User.findById(userId).lean();

    if (!user) {
      throw new HttpError('User not found', 404);
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

export const placeOrder = async (
  request: AuthenticatedRequest,
  response: Response,
  next: NextFunction
) => {
  try {
    const user = request.user;

    const { save_billing_information } = request.query;

    const data = validateSchema<z.infer<typeof placeOrderSchema>>(
      request.body,
      placeOrderSchema
    );

    const { billing_information, use_saved_billing_information } = data;

    const cart_items = await Cart.find({ user: user._id }).lean();

    if (!cart_items || cart_items.length === 0) {
      throw new HttpError(
        `No items in cart. Add the desired items to cart to place an order.`,
        422
      );
    }

    // initialize variable to store order items without populated product field
    // this is to be used to place the order
    let items = [] as OrderItem[];

    // loop through cart items and validate that each product is available
    for (const cart_item of cart_items) {
      const { product, quantity } = cart_item;

      if (product.is_archived || product.stock === 0) {
        throw new HttpError(
          `${product.name} is unavailable or out of stock.`,
          422
        );
      }

      if (product.is_deleted) {
        throw new HttpError(`${product.name} has been deleted.`, 422);
      }

      if (quantity > product.stock) {
        throw new HttpError(
          `The desired quantity of the ${product.name} exceeds the number of items in stock.`,
          422
        );
      }

      items.push({ product: product._id, quantity });
    }

    let billing: OrderBillingInformation;

    if (use_saved_billing_information) {
      const saved_billing_information = await BillingInformation.findOne({
        user: user._id,
      }).lean();

      if (!saved_billing_information) {
        throw new HttpError('Billing information not found', 404);
      }

      billing = saved_billing_information;
    } else {
      billing = billing_information as OrderBillingInformation;
    }

    const order = await Order.create({
      user: user._id,
      items,
      billing_information: billing,
      status: 'pending',
      total_price: calculateSubTotal(cart_items),
    });

    // loop through ordered items and update stock count for each
    for (const cart_item of cart_items) {
      const { product: cart_product, quantity } = cart_item;

      const product = await Product.findOne({
        _id: cart_product._id,
        is_archived: false,
        is_deleted: false,
      });

      product.stock = product.stock - quantity;

      await product.save();
    }

    await Cart.deleteMany({ user: user._id });

    if (save_billing_information === 'true') {
      const previous_billing_information = await BillingInformation.findOne({
        user: user._id,
      });

      if (!previous_billing_information) {
        const new_billing_information = await BillingInformation.create({
          user: user._id,
          ...billing,
        });
      }

      await previous_billing_information.updateOne(billing);
    }

    response
      .status(201)
      .json({ message: 'Order placed successfully', data: order });
  } catch (error: any) {
    next(error);
  }
};

export const cancelOrder = async (
  request: AuthenticatedRequest,
  response: Response,
  next: NextFunction
) => {
  try {
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

    if (order.status === 'cancelled') {
      throw new HttpError('Order has already been cancelled.', 422);
    }

    if (
      order.status === 'in-transit' ||
      // order.status === 'dispatched' ||
      order.status === 'partially-shipped' ||
      order.status === 'shipped' ||
      order.status === 'out-for-delivery' ||
      order.status === 'delivered'
    ) {
      throw new HttpError(
        'Orders that have been shipped, dispatched or delivered cannot be cancelled.',
        422
      );
    }

    order.status = 'cancelled';
    await order.save();
    // await order.deleteOne();

    // loop through ordered items and update stock count for each
    for (const order_item of order.items) {
      const { product: product_id, quantity } = order_item;

      const product = await Product.findOne({
        _id: product_id,
        // is_archived: false,
        is_deleted: false,
      });

      product.stock = product.stock + quantity;

      await product.save();
    }

    response.json({ message: 'Order cancelled successfully' });
  } catch (error: any) {
    next(error);
  }
};
// TODO: send mail for order actions..?

export const getCurrentUserBillingInformation = async (
  request: AuthenticatedRequest,
  response: Response,
  next: NextFunction
) => {
  try {
    const user = request.user;
    const saved_billing_information = await BillingInformation.findOne({
      user: user._id,
    }).lean();

    if (!saved_billing_information) {
      throw new HttpError('Billing information not found', 404);
    }

    response.json(saved_billing_information);
  } catch (error: any) {
    next(error);
  }
};
