import { Document, model, Schema } from 'mongoose';

export interface BrandSchemaInterface extends Document {
  name: string;
  logo?: string;
}

const brandSchema: Schema<BrandSchemaInterface> = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  logo: {
    type: String,
    default: null,
  },
});

const Brand = model('Brand', brandSchema);

export default Brand;
