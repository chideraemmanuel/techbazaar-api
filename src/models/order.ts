import mongoose, { Document, model, Schema } from 'mongoose';
import mongooseAutoPopulate from 'mongoose-autopopulate';
import { ProductSchemaInterface } from './product';
import { BillingInformationInterfaceSchema } from './billing-information';

export interface OrderItem {
  product: mongoose.Types.ObjectId;
  quantity: number;
}

export interface PopulatedOrderItem {
  product: ProductSchemaInterface;
  quantity: number;
}

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'in-transit'
  // | 'dispatched'
  | 'partially-shipped'
  | 'out-for-delivery'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type OrderBillingInformation = Omit<
  BillingInformationInterfaceSchema,
  keyof Document | 'user'
> & {
  _id: mongoose.Types.ObjectId;
};

export interface OrderSchemaInterface
  extends Document<mongoose.Types.ObjectId> {
  user: mongoose.Types.ObjectId;
  items: PopulatedOrderItem[];
  billing_information: OrderBillingInformation;
  status: OrderStatus;
  total_price: number;
}

const orderSchema: Schema<OrderSchemaInterface> = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      autopopulate: true,
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
    billing_information: {
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
      enum: [
        'pending',
        'processing',
        'in-transit',
        // 'dispatched',
        'partially-shipped',
        'out-for-delivery',
        'shipped',
        'delivered',
        'cancelled',
      ],
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
