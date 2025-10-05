import mongoose, { Schema, Document } from 'mongoose';
import { Assignment as AssignmentType, RubricCriterion, RubricLevel } from '@/types';

interface AssignmentDocument extends Omit<AssignmentType, '_id'>, Document {}

const rubricLevelSchema = new Schema<RubricLevel>({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  points: {
    type: Number,
    required: true,
    min: 0,
  },
});

const rubricCriterionSchema = new Schema<RubricCriterion>({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  points: {
    type: Number,
    required: true,
    min: 0,
  },
  levels: [rubricLevelSchema],
});

const assignmentSchema = new Schema<AssignmentDocument>({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['Essay', 'Report', 'Case Study', 'Research', 'Creative'],
    required: true,
  },
  classId: {
    type: String,
    required: true,
  },
  teacherId: {
    type: String,
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  rubric: {
    criteria: [rubricCriterionSchema],
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
  settings: {
    allowLateSubmission: {
      type: Boolean,
      default: false,
    },
    maxAIUsage: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },
    plagiarismCheck: {
      type: Boolean,
      default: true,
    },
  },
}, {
  timestamps: true,
});

// Indexes
assignmentSchema.index({ classId: 1 });
assignmentSchema.index({ teacherId: 1 });
assignmentSchema.index({ dueDate: 1 });
assignmentSchema.index({ isPublished: 1 });
assignmentSchema.index({ type: 1 });

// Virtual for days until due
assignmentSchema.virtual('daysUntilDue').get(function() {
  const now = new Date();
  const due = new Date(this.dueDate);
  const diffTime = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for is overdue
assignmentSchema.virtual('isOverdue').get(function() {
  return new Date() > new Date(this.dueDate);
});

// Virtual for total rubric points
assignmentSchema.virtual('totalPoints').get(function() {
  return this.rubric.criteria.reduce((total, criterion) => total + criterion.points, 0);
});

// Methods
assignmentSchema.methods.publish = function() {
  this.isPublished = true;
  return this.save();
};

assignmentSchema.methods.unpublish = function() {
  this.isPublished = false;
  return this.save();
};

assignmentSchema.methods.addRubricCriterion = function(criterion: RubricCriterion) {
  this.rubric.criteria.push(criterion);
  return this.save();
};

assignmentSchema.methods.updateRubricCriterion = function(index: number, criterion: RubricCriterion) {
  if (this.rubric.criteria[index]) {
    this.rubric.criteria[index] = criterion;
    return this.save();
  }
  throw new Error('Criterion not found');
};

export default mongoose.models.Assignment || mongoose.model<AssignmentDocument>('Assignment', assignmentSchema);