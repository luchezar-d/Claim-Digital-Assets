import mongoose from 'mongoose';

const EntitlementSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    productSlug: {
      type: String,
      required: true,
      index: true,
    },
    accessType: {
      type: String,
      enum: ['one_time', 'subscription'],
      default: 'one_time',
    },
    startsAt: {
      type: Date,
      default: Date.now,
    },
    endsAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'revoked'],
      default: 'active',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
EntitlementSchema.index({ userId: 1, status: 1 });
EntitlementSchema.index({ userId: 1, productSlug: 1 });

export default mongoose.model('Entitlement', EntitlementSchema);
