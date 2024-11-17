import mongoose, { Document, model, Schema } from 'mongoose';
import mongooseAutoPopulate from 'mongoose-autopopulate';
import { ProductSchemaInterface } from './product';

export interface WishlistSchemaInterface
  extends Document<mongoose.Types.ObjectId> {
  user: mongoose.Types.ObjectId;
  product: ProductSchemaInterface;
}

const wishlistSchema: Schema<WishlistSchemaInterface> = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      autopopulate: true,
    },
  },
  { timestamps: true }
);

wishlistSchema.plugin(mongooseAutoPopulate);

const Wishlist = model('Wishlist', wishlistSchema);

export default Wishlist;
