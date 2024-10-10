import mongoose, { Document, model, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

export interface PasswordResetSchemaInterface extends Document {
  user: mongoose.Types.ObjectId;
  OTP: string;
  expiresAt: Date;
}

const passwordResetSchema: Schema<PasswordResetSchemaInterface> = new Schema(
  {
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    OTP: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      default: () => Date.now() + 1000 * 60 * 10, // 10 minutes
      expires: 0,
      immutable: true,
    },
  },
  { timestamps: true }
);

passwordResetSchema.pre('save', async function (next) {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashed_OTP = await bcrypt.hash(this.OTP, salt);
    this.OTP = hashed_OTP;
  } catch (error: any) {
    next(error);
  }

  next();
});

const PasswordReset = model('PasswordReset', passwordResetSchema);

export default PasswordReset;
