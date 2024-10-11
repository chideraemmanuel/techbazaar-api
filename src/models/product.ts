import mongoose, { Document, model, Schema } from 'mongoose';
import mongooseAutoPopulate from 'mongoose-autopopulate';
// import { nanoid } from 'nanoid';

export type ProductCategory =
  | 'smartphones'
  | 'tablets'
  | 'laptops'
  | 'headphones'
  | 'speakers'
  | 'smartwatches'
  | 'gaming-consoles';

export interface ProductSchemaInterface extends Document {
  name: string;
  brand: mongoose.Types.ObjectId;
  description: string;
  category: ProductCategory;

  image: string;
  price: number;
  stock: number;
  //   SKU: string;
  //   rating: number;
  //   reviews: mongoose.Types.ObjectId[];
  is_featured: boolean;
  is_archived: boolean;
}

const productSchema: Schema<ProductSchemaInterface> = new Schema({
  name: {
    type: String,
    required: true,
  },
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    required: true,
    // autopopulate: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: [
      'smartphones',
      'tablets',
      'laptops',
      'headphones',
      'speakers',
      'smartwatches',
      'gaming-consoles',
    ],
  },
  image: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 1,
  },
  stock: {
    type: Number,
    required: true,
    min: 1,
  },
  is_featured: {
    type: Boolean,
    default: false,
  },
  is_archived: {
    type: Boolean,
    default: false,
  },
});

// productSchema.plugin(mongooseAutoPopulate);

productSchema.pre('save', function (next) {
  try {
    if (this.stock === 0) {
      this.is_archived = true;
    }
  } catch (error: any) {
    next(error);
  }

  next();
});

const Product = model('Product', productSchema);

export default Product;
