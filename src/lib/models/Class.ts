import mongoose, { Schema, Document } from 'mongoose';
import { Class as ClassType } from '@/types';

interface ClassDocument extends Omit<ClassType, '_id'>, Document {}

const classSchema = new Schema<ClassDocument>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  teacherId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  students: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  coTeachers: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  classCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  settings: {
    allowAIAssistance: {
      type: Boolean,
      default: true,
    },
    maxAIUsagePercent: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },
    requireOriginality: {
      type: Boolean,
      default: true,
    },
  },
}, {
  timestamps: true,
});

// Indexes
classSchema.index({ teacherId: 1 });
classSchema.index({ classCode: 1 });
classSchema.index({ isActive: 1 });
classSchema.index({ students: 1 });

// Generate random class code
classSchema.pre('save', function(next) {
  if (!this.classCode) {
    this.classCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  next();
});

// Methods
classSchema.methods.addStudent = function(studentId: string) {
  if (!this.students.includes(studentId)) {
    this.students.push(studentId);
    return this.save();
  }
  return Promise.resolve(this);
};

classSchema.methods.removeStudent = function(studentId: string) {
  this.students = this.students.filter(id => id.toString() !== studentId);
  return this.save();
};

classSchema.methods.addCoTeacher = function(teacherId: string) {
  if (!this.coTeachers.includes(teacherId)) {
    this.coTeachers.push(teacherId);
    return this.save();
  }
  return Promise.resolve(this);
};

export default mongoose.models.Class || mongoose.model<ClassDocument>('Class', classSchema);