import mongoose, { Document, model, Schema } from 'mongoose';

interface ViewSchemaInterface extends Document<mongoose.Types.ObjectId> {
  visitor_id: string;
  viewedAt: Date;
  referrer: string;
  referrer_full_url: string;
  ip_address: string;
  continent: string;
  continent_code: string;
  country: string;
  country_code: string;
  region: string;
  region_name: string;
  city: string;
  district: string;
  zip: string;
  lat: string | number;
  lon: string | number;
  timezone: string;
  isp: string;
  org: string;
  as: string;
}

const viewSchema: Schema<ViewSchemaInterface> = new Schema(
  {
    visitor_id: {
      type: String,
      required: true,
    },
    viewedAt: {
      type: Date,
      default: () => Date.now(),
    },
    referrer: {
      type: String,
      default: '',
    },
    referrer_full_url: {
      type: String,
      default: '',
    },
    ip_address: {
      type: String,
    },
    continent: {
      type: String,
      default: '',
    },
    continent_code: {
      type: String,
      default: '',
    },
    country: {
      type: String,
      default: '',
    },
    country_code: {
      type: String,
      default: '',
    },
    region: {
      type: String,
      default: '',
    },
    region_name: {
      type: String,
      default: '',
    },
    city: {
      type: String,
      default: '',
    },
    district: {
      type: String,
      default: '',
    },
    zip: {
      type: String,
      default: '',
    },
    lat: {
      type: String || Number,
      default: '',
    },
    lon: {
      type: String || Number,
      default: '',
    },
    timezone: {
      type: String,
      default: '',
    },
    isp: {
      type: String,
      default: '',
    },
    org: {
      type: String,
      default: '',
    },
    as: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

const View = model('View', viewSchema);

export default View;
