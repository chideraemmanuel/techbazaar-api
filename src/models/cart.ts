import mongoose, { Document, model, Schema } from 'mongoose';
import mongooseAutoPopulate from 'mongoose-autopopulate';
import { ProductSchemaInterface } from './product';

export interface CartSchemaInterface extends Document<mongoose.Types.ObjectId> {
  user: mongoose.Types.ObjectId;
  // product: mongoose.Types.ObjectId;
  product: ProductSchemaInterface;
  quantity: number;
}

const cartSchema: Schema<CartSchemaInterface> = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      // autopopulate: true,
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      autopopulate: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { timestamps: true }
);

cartSchema.plugin(mongooseAutoPopulate);

const Cart = model('Cart', cartSchema);

export default Cart;
