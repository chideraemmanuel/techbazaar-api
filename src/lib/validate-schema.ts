import { SafeParseReturnType, z, ZodSchema } from 'zod';
import HttpError from './http-error';

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

const validateSchema = <T>(data: any, schema: ZodSchema): T => {
  const { success, error, data: validated_data } = schema.safeParse(data);

  if (!success) {
    console.log('error.format()._errors', error.format()._errors);
    console.log(' error.flatten().fieldErrors', error.flatten().fieldErrors);

    // @ts-ignore
    throw new HttpError(Object.values(error.flatten().fieldErrors)[0], 400);
  }

  return validated_data;
};

export default validateSchema;
