import mongoose, { Document, model, Schema } from 'mongoose';

export interface SessionSchemaInterface extends Document {
  user: mongoose.Types.ObjectId;
  session_id: string;
  expiresAt: Date;
}

const sessionSchema: Schema<SessionSchemaInterface> = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    session_id: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      default: () => Date.now() + 1000 * 60 * 60 * 24, // 24 hours
      expires: 0,
      // immutable: true,
    },
    // TODO: add device and useragent to model..?
  },
  { timestamps: true }
);

const Session = model('Session', sessionSchema);

export default Session;
