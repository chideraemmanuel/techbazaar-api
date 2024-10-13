import mongoose, { Document, model, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

export interface EmailVerificationSchemaInterface
  extends Document<mongoose.Types.ObjectId> {
  user: mongoose.Types.ObjectId;
  OTP: string;
  expiresAt: Date;
}

const emailVerificationSchema: Schema<EmailVerificationSchemaInterface> =
  new Schema(
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
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

emailVerificationSchema.pre('save', async function (next) {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashed_OTP = await bcrypt.hash(this.OTP, salt);
    this.OTP = hashed_OTP;
  } catch (error: any) {
    next(error);
  }

  next();
});

const EmailVerification = model('EmailVerification', emailVerificationSchema);

export default EmailVerification;
