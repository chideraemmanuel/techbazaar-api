import { Document, model, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

export type UserAuthType = 'manual' | 'google';
export type UserRole = 'user' | 'admin';

export interface UserSchemaInterface extends Document {
  first_name: string;
  last_name: string;
  email: string;
  password?: string;
  email_verified: boolean;
  auth_type: UserAuthType;
  role: UserRole;
  disabled: boolean;
}

const userSchema: Schema<UserSchemaInterface> = new Schema(
  {
    first_name: {
      type: String,
      required: true,
    },
    last_name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      immutable: true,
    },
    password: {
      type: String,
      required: function () {
        return this.auth_type === 'manual';
      },
      select: false,
    },
    email_verified: {
      type: Boolean,
      default: false,
    },
    auth_type: {
      type: String,
      required: true,
      enum: ['manual', 'google'],
    },
    role: {
      type: String,
      default: 'user',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (this.isNew) {
    if (this.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        const hashed_password = await bcrypt.hash(this.password, salt);

        this.password = hashed_password;
      } catch (error: any) {
        next(error);
      }
    }
  }

  if (!this.isNew && this.isModified('password')) {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashed_password = await bcrypt.hash(this.password, salt);

      this.password = hashed_password;
    } catch (error: any) {
      next(error);
    }
  }

  next();
});

const User = model('User', userSchema);

export default User;
