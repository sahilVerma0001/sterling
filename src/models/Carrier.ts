import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICarrier extends Document {
  name: string;
  email: string;
  statesServed: string[];
  industries: string[];
  wholesaleFeePercent: number;
  createdAt: Date;
  updatedAt: Date;
}

const CarrierSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    statesServed: {
      type: [String],
      default: [],
      index: true,
    },
    industries: {
      type: [String],
      default: [],
      index: true,
    },
    wholesaleFeePercent: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

const Carrier: Model<ICarrier> =
  mongoose.models.Carrier || mongoose.model<ICarrier>("Carrier", CarrierSchema);

export default Carrier;
