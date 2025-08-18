import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    priceCents: {
      type: Number,
      required: true,
      min: 0,
    },
    features: [
      {
        label: {
          type: String,
          required: true,
        },
        value: mongoose.Schema.Types.Mixed,
      },
    ],
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Product', ProductSchema);
