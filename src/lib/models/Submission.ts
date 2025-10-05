import mongoose, { Schema, Document } from 'mongoose';
import { Submission as SubmissionType, SubmissionVersion } from '@/types';

interface SubmissionDocument extends Omit<SubmissionType, '_id'>, Document {}

const submissionVersionSchema = new Schema<SubmissionVersion>({
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  source: {
    type: String,
    enum: ['user', 'ai_suggestion'],
    default: 'user',
  },
});

const submissionSchema = new Schema<SubmissionDocument>({
  assignmentId: {
    type: Schema.Types.ObjectId,
    ref: 'Assignment',
    required: false,
  },
  studentId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    default: 'Untitled',
  },
  content: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'graded'],
    default: 'draft',
  },
  submittedAt: {
    type: Date,
  },
  grade: {
    type: Number,
    min: 0,
  },
  feedback: {
    type: String,
  },
  aiUsageStats: {
    totalInteractions: {
      type: Number,
      default: 0,
    },
    suggestionsAccepted: {
      type: Number,
      default: 0,
    },
    suggestionsRejected: {
      type: Number,
      default: 0,
    },
    aiPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    originalityScore: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },
  },
  writingStats: {
    timeSpentWriting: {
      type: Number,
      default: 0,
    },
    timeSpentEditing: {
      type: Number,
      default: 0,
    },
    wordCount: {
      type: Number,
      default: 0,
    },
    characterCount: {
      type: Number,
      default: 0,
    },
    revisionsCount: {
      type: Number,
      default: 0,
    },
  },
  versions: [submissionVersionSchema],
}, {
  timestamps: true,
});

// Indexes
submissionSchema.index({ assignmentId: 1 });
submissionSchema.index({ studentId: 1 });
submissionSchema.index({ status: 1 });
submissionSchema.index({ submittedAt: 1 });

// Virtual for word count
submissionSchema.virtual('currentWordCount').get(function() {
  return this.content.split(/\s+/).filter(word => word.length > 0).length;
});

// Virtual for is late
submissionSchema.virtual('isLate').get(function() {
  if (!this.submittedAt) return false;
  return this.populated('assignmentId') &&
         this.submittedAt > this.assignmentId.dueDate;
});

// Pre-save middleware to update writing stats
submissionSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    this.writingStats.wordCount = this.currentWordCount;
    this.writingStats.characterCount = this.content.length;
    this.writingStats.revisionsCount += 1;

    // Add version if content changed significantly
    if (this.versions.length === 0 ||
        this.versions[this.versions.length - 1].content !== this.content) {
      this.versions.push({
        content: this.content,
        timestamp: new Date(),
        source: 'user',
      });
    }
  }
  next();
});

// Methods
submissionSchema.methods.submit = function() {
  this.status = 'submitted';
  this.submittedAt = new Date();
  return this.save();
};

submissionSchema.methods.unsubmit = function() {
  this.status = 'draft';
  this.submittedAt = undefined;
  return this.save();
};

submissionSchema.methods.setGrade = function(score: number, feedback?: string) {
  this.status = 'graded';
  this.grade = score;
  if (feedback) this.feedback = feedback;
  return this.save();
};

submissionSchema.methods.addAIInteraction = function(accepted: boolean, tokensUsed: number = 0) {
  this.aiUsageStats.totalInteractions += 1;
  if (accepted) {
    this.aiUsageStats.suggestionsAccepted += 1;
  } else {
    this.aiUsageStats.suggestionsRejected += 1;
  }

  // Recalculate AI percentage
  const totalSuggestions = this.aiUsageStats.suggestionsAccepted + this.aiUsageStats.suggestionsRejected;
  if (totalSuggestions > 0) {
    this.aiUsageStats.aiPercentage = (this.aiUsageStats.suggestionsAccepted / totalSuggestions) * 100;
  }

  // Update originality score (inverse of AI percentage)
  this.aiUsageStats.originalityScore = Math.max(0, 100 - this.aiUsageStats.aiPercentage);

  return this.save();
};

submissionSchema.methods.addVersion = function(content: string, source: 'user' | 'ai_suggestion' = 'user') {
  this.versions.push({
    content,
    timestamp: new Date(),
    source,
  });
  return this.save();
};

export default mongoose.models.Submission || mongoose.model<SubmissionDocument>('Submission', submissionSchema);