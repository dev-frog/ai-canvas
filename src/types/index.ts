export interface User {
  _id: string;
  firebaseUid: string;
  email: string;
  name: string;
  role: 'student' | 'teacher' | 'admin';
  subscriptionStatus: 'free' | 'active' | 'canceled' | 'expired';
  stripeCustomerId?: string;
  subscriptionTier: 'free' | 'monthly' | 'yearly';
  aiTokensUsed: number;
  aiTokensLimit: number;
  classes: string[];
  createdAt: Date;
  updatedAt: Date;
  lastLogin: Date;
  preferences: {
    citationStyle: 'APA' | 'MLA' | 'Harvard' | 'Chicago';
    autoSave: boolean;
    aiAssistanceLevel: 'minimal' | 'moderate' | 'full';
  };
}

export interface Class {
  _id: string;
  name: string;
  description: string;
  teacherId: string;
  students: string[];
  coTeachers: string[];
  classCode: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  settings: {
    allowAIAssistance: boolean;
    maxAIUsagePercent: number;
    requireOriginality: boolean;
  };
}

export interface Assignment {
  _id: string;
  title: string;
  description: string;
  type: 'Essay' | 'Report' | 'Case Study' | 'Research' | 'Creative';
  classId: string;
  teacherId: string;
  dueDate: Date;
  rubric: {
    criteria: RubricCriterion[];
  };
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  settings: {
    allowLateSubmission: boolean;
    maxAIUsage: number;
    plagiarismCheck: boolean;
  };
}

export interface RubricCriterion {
  name: string;
  description: string;
  points: number;
  levels: RubricLevel[];
}

export interface RubricLevel {
  name: string;
  description: string;
  points: number;
}

export interface Submission {
  _id: string;
  assignmentId?: string;
  studentId: string;
  title: string;
  content: string;
  assignmentType?: 'Essay' | 'Research Paper' | 'Report' | 'Case Study Response' | 'Literature Review' | 'Annotated Bibliography' | 'Reflective Writing/Journal';
  status: 'draft' | 'submitted' | 'graded';
  submittedAt?: Date;
  grade?: number;
  feedback?: string;
  aiUsageStats: {
    totalInteractions: number;
    suggestionsAccepted: number;
    suggestionsRejected: number;
    aiPercentage: number;
    originalityScore: number;
  };
  writingStats: {
    timeSpentWriting: number;
    timeSpentEditing: number;
    wordCount: number;
    characterCount: number;
    revisionsCount: number;
  };
  versions: SubmissionVersion[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SubmissionVersion {
  content: string;
  timestamp: Date;
  source: 'user' | 'ai_suggestion';
}

export interface AIInteraction {
  _id: string;
  userId: string;
  submissionId: string;
  type: 'suggestion' | 'citation' | 'humanize' | 'explain';
  prompt: string;
  response: string;
  accepted: boolean;
  timestamp: Date;
  tokenUsage: number;
  context: {
    selectionStart: number;
    selectionEnd: number;
    selectedText: string;
  };
}

export interface PaymentLog {
  _id: string;
  userId: string;
  stripeEventId: string;
  eventType: string;
  amount: number;
  currency: string;
  status: string;
  subscriptionId: string;
  timestamp: Date;
  metadata: Record<string, any>;
}

export interface ActivityLog {
  _id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  metadata: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

export interface AIContextType {
  generateSuggestion: (content: string, context: string, type: string) => Promise<string>;
  generateCitation: (query: string, style: string) => Promise<string>;
  humanizeContent: (content: string) => Promise<string>;
  explainConcept: (concept: string, context: string) => Promise<string>;
  isLoading: boolean;
  error: string | null;
}

export interface SubscriptionContextType {
  subscription: any;
  usage: {
    aiTokensUsed: number;
    aiTokensLimit: number;
    percentageUsed: number;
  };
  createCheckoutSession: (priceId: string) => Promise<string>;
  cancelSubscription: () => Promise<void>;
  isLoading: boolean;
}

export type ModalType = 'create-assignment' | 'create-class' | 'invite-students' | 'upgrade-plan' | 'confirm-delete';

export interface ModalContextType {
  isOpen: boolean;
  type: ModalType | null;
  data: any;
  openModal: (type: ModalType, data?: any) => void;
  closeModal: () => void;
}