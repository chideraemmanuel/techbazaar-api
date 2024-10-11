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
  SKU: string;
  slug: string;
  //   rating: number;
  //   reviews: mongoose.Types.ObjectId[];
  is_featured: boolean;
  is_archived: boolean;
}

const productSchema: Schema<ProductSchemaInterface> = new Schema(
  {
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
    SKU: {
      type: String,
      unique: true,
      immutable: true,
    },
    slug: {
      type: String,
      unique: true,
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
  },
  { timestamps: true }
);

// productSchema.plugin(mongooseAutoPopulate);

productSchema.pre('save', async function (next) {
  if (this.isNew) {
    try {
      const { customAlphabet } = await import('nanoid');
      const nanoid = customAlphabet(
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890',
        5
      );

      const SKU = nanoid();
      this.SKU = SKU;

      this.slug = encodeURIComponent(
        `${this.name} ${SKU}`.replaceAll(' ', '-').toLowerCase()
      );
    } catch (error: any) {
      next(error);
    }
  }

  if (!this.isNew && this.isModified('name')) {
    try {
      this.slug = encodeURIComponent(
        `${this.name} ${this.SKU}`.replaceAll(' ', '-').toLowerCase()
      );
    } catch (error: any) {
      next(error);
    }
  }

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