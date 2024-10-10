import { SafeParseReturnType, ZodSchema } from 'zod';

/**
 *
 * @param data the data to be valiated
 * @param schema the schema to use for the validation
 * @returns
 */
// const validateSchema = (data: any, schema: ZodSchema) => {
//   return schema.safeParse(data);
// };

// export default validateSchema;

const validateSchema = <T>(
  data: any,
  schema: ZodSchema
): SafeParseReturnType<T, T> => {
  return schema.safeParse(data);
};

export default validateSchema;

// const { success, error, data } = validateSchema<z.infer<typeof userRegistrationSchema>>(request.body, userRegistrationSchema);
