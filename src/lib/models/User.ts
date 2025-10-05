import mongoose, { Schema, Document } from 'mongoose';
import { User as UserType } from '@/types';

interface UserDocument extends Omit<UserType, '_id'>, Document {}

const userSchema = new Schema<UserDocument>({
  firebaseUid: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin'],
    required: true,
    default: 'student',
  },
  subscriptionStatus: {
    type: String,
    enum: ['free', 'active', 'canceled', 'expired'],
    default: 'free',
  },
  stripeCustomerId: {
    type: String,
    sparse: true,
  },
  subscriptionTier: {
    type: String,
    enum: ['free', 'monthly', 'yearly'],
    default: 'free',
  },
  aiTokensUsed: {
    type: Number,
    default: 0,
  },
  aiTokensLimit: {
    type: Number,
    default: 1000, // Free tier limit
  },
  classes: [{
    type: Schema.Types.ObjectId,
    ref: 'Class',
  }],
  preferences: {
    citationStyle: {
      type: String,
      enum: ['APA', 'MLA', 'Harvard', 'Chicago'],
      default: 'APA',
    },
    autoSave: {
      type: Boolean,
      default: true,
    },
    aiAssistanceLevel: {
      type: String,
      enum: ['minimal', 'moderate', 'full'],
      default: 'moderate',
    },
  },
  lastLogin: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Indexes for performance
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ firebaseUid: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ subscriptionStatus: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return this.name;
});

// Method to check if user has reached AI token limit
userSchema.methods.hasReachedTokenLimit = function() {
  return this.aiTokensUsed >= this.aiTokensLimit;
};

// Method to increment AI token usage
userSchema.methods.incrementTokenUsage = function(tokens: number) {
  this.aiTokensUsed += tokens;
  return this.save();
};

// Method to reset monthly tokens (for subscription users)
userSchema.methods.resetMonthlyTokens = function() {
  this.aiTokensUsed = 0;
  return this.save();
};

export default mongoose.models.User || mongoose.model<UserDocument>('User', userSchema);