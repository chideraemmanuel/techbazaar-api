import { ZodSchema } from 'zod';
import HttpError from './http-error';

/**
 *
 * @param data the data to be valiated
 * @param schema the schema to use for the validation
 * @returns a type-safe validated data
 */

const validateSchema = <T>(data: any, schema: ZodSchema): T => {
  const { success, error, data: validated_data } = schema.safeParse(data);

  if (!success) {
    // @ts-ignore
    throw new HttpError(Object.values(error.flatten().fieldErrors)[0], 400);
  }

  return validated_data;
};

export default validateSchema;
