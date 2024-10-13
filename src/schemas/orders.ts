import z from 'zod';

export const getOrdersFilterSchema = z
  .object({
    status: z
      .enum(['pending', 'dispatched', 'shipped', 'delivered'])
      .optional(),
    // date_range: z.string().optional(), // TODO: implement this..?
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
  .refine((data) => !data.sort_by || data.sort_order, {
    path: ['sort_order'],
    message: `Sorting order isn't specified`,
  });

export const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'dispatched', 'shipped', 'delivered']).optional(),
});
