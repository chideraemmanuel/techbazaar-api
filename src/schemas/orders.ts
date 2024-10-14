import isValidISODate from 'lib/is-valid-ISO-date';
import z from 'zod';

export const getOrdersFilterSchema = z
  .object({
    status: z
      .enum(['pending', 'dispatched', 'shipped', 'delivered'])
      .optional(),
    start_date: z
      .string()
      .optional()
      .refine(isValidISODate, {
        message: 'Invalid start_date. Must be in YYYY-MM-DD format.',
      })
      .transform((value) => new Date(value)),
    end_date: z
      .string()
      .optional()
      .refine(isValidISODate, {
        message: 'Invalid end_date. Must be in YYYY-MM-DD format.',
      })
      .transform((value) => new Date(value)),
    page: z
      .string()
      .refine((value) => /^\d$/.test(value), 'Page should be a numeric value')
      .optional(),
    limit: z
      .string()
      .refine((value) => /^\d$/.test(value), 'Limit should be a numeric value')
      .optional(),
    sort_by: z.enum(['date_created', 'date_updated']).optional(),
    sort_order: z.enum(['ascending', 'descending']).optional(),
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
  status: z.enum(['pending', 'dispatched', 'shipped', 'delivered']).optional(),
});
