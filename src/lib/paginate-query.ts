import mongoose from 'mongoose';
import express from 'express';

interface Params {
  model: mongoose.Model<any>;
  filter?: any;
  page?: number;
  limit?: number;
  // sort_by?: 'name' | 'price';
  sort_by?: string;
  sort_order?: 'ascending' | 'descending';
}

const paginateQuery = async ({
  model,
  filter,
  page,
  limit,
  sort_by,
  sort_order,
}: Params) => {
  const pageNumber = page && Math.ceil(page) > 0 ? Math.ceil(page) : 1;

  // set max limit to 50
  const limitNumber = !limit
    ? 20
    : limit > 50
    ? 50
    : Math.ceil(limit) <= 0
    ? 20
    : Math.ceil(limit);

  const data = await model
    .find(filter)
    .skip((pageNumber - 1) * limitNumber)
    .limit(limitNumber)
    .sort(sort_by && sort_order && { [sort_by]: sort_order })
    .exec();

  const total_records = await model.countDocuments(filter);

  const total_pages = Math.ceil(total_records / limitNumber);

  const current_page = pageNumber;

  const previous_page = pageNumber === 1 ? null : pageNumber - 1;

  const next_page =
    total_pages === 0 || pageNumber === total_pages ? null : pageNumber + 1;

  const result = {
    data,
    pagination: {
      total_records,
      total_pages,
      current_page,
      previous_page,
      next_page,
    },
  };

  return result;
};

export default paginateQuery;
