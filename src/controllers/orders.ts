import { NextFunction, Response } from 'express';
import HttpError from '../lib/http-error';
import { AuthorizedRequest } from '../middlewares/auth';
import Order, { OrderStatus } from '../models/order';
import validateSchema from '../lib/validate-schema';
import z from 'zod';
import {
  getOrdersFilterSchema,
  updateOrderStatusSchema,
} from '../schemas/orders';
import paginateQuery from 'lib/paginate-query';
import mongoose from 'mongoose';

interface GetOrdersFilter {
  status?: OrderStatus;
}

export const getAllOrders = async (
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

    const data = validateSchema<z.infer<typeof getOrdersFilterSchema>>(
      request.query,
      getOrdersFilterSchema
    );

    const { status, page, limit, sort_by, sort_order } = data;

    const filter: GetOrdersFilter = {};

    if (status) {
      filter.status = status;
    }

    const paginationResult = await paginateQuery({
      model: Order,
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
    });

    response.json(paginationResult);
  } catch (error: any) {
    next(error);
  }
};

export const getOrderById = async (
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

    const { orderId } = request.params;

    if (!mongoose.isValidObjectId(orderId)) {
      throw new HttpError('Invalid order ID', 400);
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

export const updateOrderStatus = async (
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

    const { orderId } = request.params;

    if (!mongoose.isValidObjectId(orderId)) {
      throw new HttpError('Invalid order ID', 400);
    }

    const order = await Order.findById(orderId);

    if (!order) {
      throw new HttpError(
        'Order with the provided ID does not exist or has been cancelled',
        404
      );
    }

    const data = validateSchema<z.infer<typeof updateOrderStatusSchema>>(
      request.body,
      updateOrderStatusSchema
    );

    if (Object.keys(data).length === 0) {
      throw new HttpError('No field to be updated was supplied', 400);
    }

    const { status } = data;

    order.status = status;

    const updated_order = await order.save();

    response.json({
      message: 'Order status updated successfully',
      data: updated_order,
    });
  } catch (error: any) {
    next(error);
  }
};
