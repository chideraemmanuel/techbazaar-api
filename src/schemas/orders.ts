import isValidISODate from '../lib/is-valid-ISO-date';
import z from 'zod';
import {
  ISODateSchema,
  numberFilterchema,
  ORDER_STATUS_SCHEMA,
  SORT_ORDER_SCHEMA,
} from './constants';

export const getOrdersFilterSchema = z
  .object({
    status: ORDER_STATUS_SCHEMA.optional(),
    start_date: ISODateSchema('start_date').optional(),
    end_date: ISODateSchema('end_date').optional(),
    page: numberFilterchema('page').optional(),
    limit: numberFilterchema('limit').optional(),
    sort_by: z.enum(['date_created', 'date_updated']).optional(),
    sort_order: SORT_ORDER_SCHEMA.optional(),
  })
  .refine(
    (data) => {
      if (data.start_date && data.end_date) {
        const startDate = new Date(data.start_date);
        const endDate = new Date(data.end_date);
        return startDate <= endDate;
      }
      return true; // If one or both dates are missing, skip this validation
    },
    {
      message: 'start_date must be before or equal to end_date.',
      path: ['end_date'], // Attach the error to the end_date field
    }
  )
  .refine((data) => !data.sort_by || data.sort_order, {
    path: ['sort_order'],
    message: `Sorting order isn't specified`,
  });

export const updateOrderStatusSchema = z.object({
  status: ORDER_STATUS_SCHEMA.optional(),
});
