import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxLength: 120
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  passwordHash: {
    type: String,
    required: true,
    select: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  roles: {
    type: [String],
    enum: ['user', 'admin'],
    default: ['user']
  },
  lastLogin: {
    type: Date,
    default: null
  },
  stripeCustomerId: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Create unique index on email with case-insensitive collation
UserSchema.index(
  { email: 1 }, 
  { 
    unique: true,
    collation: { locale: 'en', strength: 2 }
  }
);

export default mongoose.model('User', UserSchema);
