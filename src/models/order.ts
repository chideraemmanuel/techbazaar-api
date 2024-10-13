import mongoose, { Document, model, Schema } from 'mongoose';
import mongooseAutoPopulate from 'mongoose-autopopulate';
import { ProductSchemaInterface } from './product';

export interface OrderItem {
  // product: mongoose.Types.ObjectId;
  product: ProductSchemaInterface;
  quantity: number;
}

export interface OrderAddress {
  street: string;
  city: string;
  state: string;
  country: string;
}

export interface OrderBillingAddress {
  receipent_first_name: string;
  receipent_last_name: string;
  address: OrderAddress;
}

export type OrderStatus = 'pending' | 'shipped' | 'delivered';

export interface OrderSchemaInterface extends Document {
  user: mongoose.Types.ObjectId;
  items: OrderItem[];
  billing: OrderBillingAddress;
  status: OrderStatus;
  total_price: number;
}

const orderSchema: Schema<OrderSchemaInterface> = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [
      {
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
    ],
    billing: {
      receipent_first_name: {
        type: String,
        // required: true
      },
      receipent_last_name: {
        type: String,
        // required: true
      },
      address: {
        street: {
          type: String,
          required: true,
        },
        city: {
          type: String,
          required: true,
        },
        state: {
          type: String,
          required: true,
        },
        country: {
          type: String,
          required: true,
        },
      },
    },
  },
  { timestamps: true }
);

orderSchema.plugin(mongooseAutoPopulate);

const Order = model('Order', orderSchema);

export default Order;
