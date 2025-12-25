import mongoose, { Schema, Document, Model } from "mongoose";

export type QuoteStatus = 
  | "ENTERED" 
  | "POSTED" 
  | "APPROVED"
  | "PAYMENT_RECEIVED"
  | "BIND_REQUESTED"
  | "BOUND";

export interface ILimits {
  generalLiability?: string; // e.g., "1M / 1M / 1M"
  aggregateLimit?: string;
  productsCompletedOps?: string;
  personalAdvertisingInjury?: string;
  fireLegalLimit?: string;
  medicalExpenseLimit?: string;
  deductible?: string;
}

export interface IQuote extends Document {
  submissionId: mongoose.Types.ObjectId;
  carrierId: mongoose.Types.ObjectId;
  
  // Premium breakdown
  carrierQuoteUSD: number;
  wholesaleFeePercent?: number; // Optional - removed per user request
  wholesaleFeeAmountUSD?: number; // Optional - removed per user request
  brokerFeeAmountUSD: number;
  premiumTaxPercent?: number;
  premiumTaxAmountUSD?: number;
  policyFeeUSD?: number;
  finalAmountUSD: number;
  
  // Policy details
  limits?: ILimits;
  endorsements?: string[]; // Array of endorsement names
  effectiveDate?: Date;
  expirationDate?: Date;
  policyNumber?: string;
  specialNotes?: string;
  
  // Documents
  binderPdfUrl?: string;
  
  status: QuoteStatus;
  // Admin entry fields
  enteredByAdminId?: mongoose.Types.ObjectId;
  enteredAt?: Date;
  postedAt?: Date;
  carrierReference?: string; // Carrier quote number/reference
  // Agency approval fields
  approvedAt?: Date;
  approvedByUserId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const LimitsSchema: Schema = new Schema({
  generalLiability: String,
  aggregateLimit: String,
  productsCompletedOps: String,
  personalAdvertisingInjury: String,
  fireLegalLimit: String,
  medicalExpenseLimit: String,
  deductible: String,
}, { _id: false });

const QuoteSchema: Schema = new Schema(
  {
    submissionId: {
      type: Schema.Types.ObjectId,
      ref: "Submission",
      required: true,
      index: true,
    },
    carrierId: {
      type: Schema.Types.ObjectId,
      ref: "Carrier",
      required: true,
    },
    // Premium breakdown
    carrierQuoteUSD: {
      type: Number,
      required: true,
      min: 0,
    },
    wholesaleFeePercent: {
      type: Number,
      required: false, // Optional - removed per user request
      min: 0,
      max: 100,
    },
    wholesaleFeeAmountUSD: {
      type: Number,
      required: false, // Optional - removed per user request
      min: 0,
    },
    brokerFeeAmountUSD: {
      type: Number,
      default: 0,
      min: 0,
    },
    premiumTaxPercent: {
      type: Number,
      min: 0,
      max: 100,
    },
    premiumTaxAmountUSD: {
      type: Number,
      min: 0,
    },
    policyFeeUSD: {
      type: Number,
      min: 0,
    },
    finalAmountUSD: {
      type: Number,
      required: true,
      min: 0,
    },
    // Policy details
    limits: {
      type: LimitsSchema,
    },
    endorsements: {
      type: [String],
      default: [],
    },
    effectiveDate: {
      type: Date,
    },
    expirationDate: {
      type: Date,
    },
    policyNumber: {
      type: String,
      trim: true,
    },
    specialNotes: {
      type: String,
    },
    // Documents
    binderPdfUrl: {
      type: String,
    },
    status: {
      type: String,
      enum: ["ENTERED", "POSTED", "APPROVED", "PAYMENT_RECEIVED", "BIND_REQUESTED", "BOUND"],
      default: "ENTERED",
      index: true,
    },
    // Admin entry fields
    enteredByAdminId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    enteredAt: {
      type: Date,
    },
    postedAt: {
      type: Date,
    },
    carrierReference: {
      type: String,
      trim: true,
    },
    // Agency approval fields
    approvedAt: {
      type: Date,
    },
    approvedByUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
QuoteSchema.index({ submissionId: 1, status: 1 });

// Delete model from cache if it exists (to handle schema changes in development)
if (mongoose.models.Quote) {
  delete mongoose.models.Quote;
}

const Quote: Model<IQuote> = mongoose.model<IQuote>("Quote", QuoteSchema);

export default Quote;
