import mongoose, { Document, model, Schema } from 'mongoose';

export interface BrandSchemaInterface
  extends Document<mongoose.Types.ObjectId> {
  name: string;
  logo?: string;
  is_deleted?: boolean;
  deleted_at?: Date;
}

const brandSchema: Schema<BrandSchemaInterface> = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    logo: {
      type: String,
      default: null,
    },
    is_deleted: {
      type: Boolean,
      default: false,
      select: false,
    },
    deleted_at: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true }
);

brandSchema.pre('save', function (next) {
  try {
    if (this.isModified('is_deleted')) {
      if (this.is_deleted) {
        this.deleted_at = new Date(Date.now());
      } else {
        delete this.deleted_at;
      }
    }
  } catch (error: any) {
    next(error);
  }

  next();
});

const Brand = model('Brand', brandSchema);

export default Brand;
