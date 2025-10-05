import mongoose, { Schema, Document } from 'mongoose';
import { AIInteraction as AIInteractionType } from '@/types';

interface AIInteractionDocument extends Omit<AIInteractionType, '_id'>, Document {}

const aiInteractionSchema = new Schema<AIInteractionDocument>({
  userId: {
    type: String,
    required: true,
  },
  submissionId: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['suggestion', 'citation', 'humanize', 'explain'],
    required: true,
  },
  prompt: {
    type: String,
    required: true,
  },
  response: {
    type: String,
    required: true,
  },
  accepted: {
    type: Boolean,
    default: false,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  tokenUsage: {
    type: Number,
    default: 0,
  },
  context: {
    selectionStart: {
      type: Number,
      default: 0,
    },
    selectionEnd: {
      type: Number,
      default: 0,
    },
    selectedText: {
      type: String,
      default: '',
    },
  },
}, {
  timestamps: true,
});

// Indexes
aiInteractionSchema.index({ userId: 1 });
aiInteractionSchema.index({ submissionId: 1 });
aiInteractionSchema.index({ type: 1 });
aiInteractionSchema.index({ timestamp: 1 });
aiInteractionSchema.index({ accepted: 1 });

// Static methods
aiInteractionSchema.statics.getUsageByUser = function(userId: string, startDate?: Date, endDate?: Date) {
  const match: any = { userId };

  if (startDate || endDate) {
    match.timestamp = {};
    if (startDate) match.timestamp.$gte = startDate;
    if (endDate) match.timestamp.$lte = endDate;
  }

  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        accepted: { $sum: { $cond: ['$accepted', 1, 0] } },
        totalTokens: { $sum: '$tokenUsage' },
      },
    },
  ]);
};

aiInteractionSchema.statics.getUsageBySubmission = function(submissionId: string) {
  return this.aggregate([
    { $match: { submissionId } },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        accepted: { $sum: { $cond: ['$accepted', 1, 0] } },
        totalTokens: { $sum: '$tokenUsage' },
      },
    },
  ]);
};

export default mongoose.models.AIInteraction || mongoose.model<AIInteractionDocument>('AIInteraction', aiInteractionSchema);