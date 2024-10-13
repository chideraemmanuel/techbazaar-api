import mongoose, { Document, model, Schema } from 'mongoose';
import mongooseAutoPopulate from 'mongoose-autopopulate';
import { ProductSchemaInterface } from './product';

export interface OrderItem {
  product: mongoose.Types.ObjectId;
  quantity: number;
}

export interface PopulatedOrderItem {
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
  receipent: {
    first_name: string;
    last_name: string;
    mobile_number: string;
  };
  address: OrderAddress;
}

export type OrderStatus = 'pending' | 'dispatched' | 'shipped' | 'delivered';

export interface OrderSchemaInterface
  extends Document<mongoose.Types.ObjectId> {
  user: mongoose.Types.ObjectId;
  items: PopulatedOrderItem[];
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
      receipent: {
        first_name: {
          type: String,
          required: true,
        },
        last_name: {
          type: String,
          required: true,
        },
        mobile_number: {
          type: String,
          required: true,
        },
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
    status: {
      type: String,
      default: 'pending',
      enum: ['pending', 'dispatched', 'shipped', 'delivered'],
    },
    total_price: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

orderSchema.plugin(mongooseAutoPopulate);

const Order = model('Order', orderSchema);

export default Order;
