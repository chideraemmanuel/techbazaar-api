import mongoose, { Document, model, Schema } from 'mongoose';
import mongooseAutoPopulate from 'mongoose-autopopulate';

export interface CartSchemaInterface extends Document {
  user: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  quantity: number;
}

const cartSchema: Schema<CartSchemaInterface> = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    // // autopopulate: true,
  },

  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    // autopopulate: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
});

// cartSchema.plugin(mongooseAutoPopulate);

const Cart = model('Cart', cartSchema);

export default Cart;
