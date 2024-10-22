import mongoose, { Document, model, Schema } from 'mongoose';

export interface BillingAddress {
  street: string;
  city: string;
  state: string;
  country: string;
}

export interface BillingInformationInterfaceSchema
  extends Document<mongoose.Types.ObjectId> {
  user: mongoose.Types.ObjectId;
  receipent: {
    first_name: string;
    last_name: string;
    mobile_number: string;
  };
  address: BillingAddress;
}

export const billingInformationSchema: Schema<BillingInformationInterfaceSchema> =
  new Schema(
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
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
    { timestamps: true }
  );

const BillingInformation = model(
  'BillingInformation',
  billingInformationSchema
);

export default BillingInformation;
