# AI Assignment Canvas - Technical Architecture

## 1. MongoDB Schema Design

### Users Collection
```javascript
{
  _id: ObjectId,
  firebaseUid: String, // Firebase Auth UID
  email: String,
  name: String,
  role: String, // "student", "teacher", "admin"
  subscriptionStatus: String, // "free", "active", "canceled", "expired"
  stripeCustomerId: String,
  subscriptionTier: String, // "free", "monthly", "yearly"
  aiTokensUsed: Number,
  aiTokensLimit: Number,
  classes: [ObjectId], // References to classes they belong to
  createdAt: Date,
  updatedAt: Date,
  lastLogin: Date,
  preferences: {
    citationStyle: String, // "APA", "MLA", "Harvard", "Chicago"
    autoSave: Boolean,
    aiAssistanceLevel: String // "minimal", "moderate", "full"
  }
}
```

### Classes Collection
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  teacherId: ObjectId, // Reference to Users
  students: [ObjectId], // References to Users
  coTeachers: [ObjectId], // References to Users
  classCode: String, // Unique invite code
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date,
  settings: {
    allowAIAssistance: Boolean,
    maxAIUsagePercent: Number,
    requireOriginality: Boolean
  }
}
```

### Assignments Collection
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  type: String, // "Essay", "Report", "Case Study", "Research", "Creative"
  classId: ObjectId, // Reference to Classes
  teacherId: ObjectId, // Reference to Users
  dueDate: Date,
  rubric: {
    criteria: [{
      name: String,
      description: String,
      points: Number,
      levels: [{
        name: String,
        description: String,
        points: Number
      }]
    }]
  },
  isPublished: Boolean,
  createdAt: Date,
  updatedAt: Date,
  settings: {
    allowLateSubmission: Boolean,
    maxAIUsage: Number, // Percentage
    plagiarismCheck: Boolean
  }
}
```

### Submissions Collection
```javascript
{
  _id: ObjectId,
  assignmentId: ObjectId, // Reference to Assignments
  studentId: ObjectId, // Reference to Users
  content: String, // Rich text content
  status: String, // "draft", "submitted", "graded"
  submittedAt: Date,
  grade: Number,
  feedback: String,
  aiUsageStats: {
    totalInteractions: Number,
    suggestionsAccepted: Number,
    suggestionsRejected: Number,
    aiPercentage: Number,
    originalityScore: Number
  },
  writingStats: {
    timeSpentWriting: Number, // milliseconds
    timeSpentEditing: Number,
    wordCount: Number,
    characterCount: Number,
    revisionsCount: Number
  },
  versions: [{
    content: String,
    timestamp: Date,
    source: String // "user", "ai_suggestion"
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### AI Interactions Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId, // Reference to Users
  submissionId: ObjectId, // Reference to Submissions
  type: String, // "suggestion", "citation", "humanize", "explain"
  prompt: String,
  response: String,
  accepted: Boolean,
  timestamp: Date,
  tokenUsage: Number,
  context: {
    selectionStart: Number,
    selectionEnd: Number,
    selectedText: String
  }
}
```

### Payment Logs Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId, // Reference to Users
  stripeEventId: String,
  eventType: String, // "subscription.created", "payment.succeeded", etc.
  amount: Number,
  currency: String,
  status: String,
  subscriptionId: String,
  timestamp: Date,
  metadata: Object
}
```

### Activity Logs Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId, // Reference to Users
  action: String, // "login", "assignment_created", "ai_interaction", etc.
  resource: String, // "submission", "assignment", "class"
  resourceId: ObjectId,
  metadata: Object,
  ipAddress: String,
  userAgent: String,
  timestamp: Date
}
```

## 2. REST API Endpoints

### Authentication Endpoints
```
POST /api/auth/login
Request: { idToken: string } // Firebase ID token
Response: { user: User, accessToken: string }

POST /api/auth/register
Request: { idToken: string, role: string }
Response: { user: User, accessToken: string }

POST /api/auth/logout
Request: { accessToken: string }
Response: { success: boolean }
```

### User Management
```
GET /api/users/profile
Headers: { Authorization: "Bearer <token>" }
Response: { user: User }

PUT /api/users/profile
Request: { name: string, preferences: object }
Response: { user: User }

GET /api/users/subscription
Response: { subscription: object, usage: object }
```

### Class Management
```
GET /api/classes
Response: { classes: Class[] }

POST /api/classes
Request: { name: string, description: string }
Response: { class: Class }

POST /api/classes/:id/join
Request: { classCode: string }
Response: { success: boolean, class: Class }

GET /api/classes/:id/students
Response: { students: User[] }
```

### Assignment Management

```
GET /api/assignments
Query: { classId?: string, status?: string }
Response: { assignments: Assignment[] }

POST /api/assignments
Request: { title: string, description: string, classId: string, rubric: object }
Response: { assignment: Assignment }

GET /api/assignments/:id
Response: { assignment: Assignment }
```

### Submission Management

```
GET /api/submissions
Query: { assignmentId?: string, studentId?: string }
Response: { submissions: Submission[] }

POST /api/submissions
Request: { assignmentId: string, content: string }
Response: { submission: Submission }

PUT /api/submissions/:id
Request: { content: string }
Response: { submission: Submission }

POST /api/submissions/:id/submit
Response: { submission: Submission }
```

### AI Assistant Endpoints

```
POST /api/ai/suggest
Request: {
  content: string,
  context: string,
  type: "improve" | "continue" | "rephrase"
}
Response: { suggestion: string, tokenUsage: number }

POST /api/ai/cite
Request: { query: string, style: "APA" | "MLA" | "Harvard" | "Chicago" }
Response: { citation: string }

POST /api/ai/humanize
Request: { content: string }
Response: { humanizedContent: string, changes: object[] }

POST /api/ai/explain
Request: { concept: string, context: string }
Response: { explanation: string }
```

### Payment Endpoints

```
POST /api/payments/create-checkout
Request: { priceId: string }
Response: { checkoutUrl: string }

POST /api/payments/webhook
Request: Stripe webhook payload
Response: { received: boolean }

GET /api/payments/subscription
Response: { subscription: object, invoices: object[] }
```

## 3. React/Next.js Component Structure

### Page Components

```
pages/
├── index.tsx                    // Landing page
├── login.tsx                    // Login/Register page
├── dashboard.tsx                // Role-based dashboard
├── assignments/
│   ├── index.tsx               // Assignment list
│   ├── [id].tsx               // Assignment details
│   └── create.tsx             // Create assignment (teachers)
├── canvas/
│   └── [submissionId].tsx     // Assignment canvas workspace
├── classes/
│   ├── index.tsx              // Class list
│   ├── [id].tsx              // Class details
│   └── create.tsx            // Create class (teachers)
├── profile.tsx                // User profile
├── subscription.tsx           // Subscription management
└── admin/
    ├── dashboard.tsx          // Admin dashboard
    ├── users.tsx             // User management
    └── analytics.tsx         // System analytics
```

### Component Structure

```
components/
├── Layout/
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   ├── Footer.tsx
│   └── Layout.tsx
├── Auth/
│   ├── LoginForm.tsx
│   ├── RegisterForm.tsx
│   └── ProtectedRoute.tsx
├── Canvas/
│   ├── AssignmentCanvas.tsx    // Main canvas component
│   ├── TextEditor.tsx          // Rich text editor
│   ├── AIAssistant.tsx         // AI panel
│   ├── RubricTracker.tsx       // Progress tracker
│   └── WritingStats.tsx        // Time/originality stats
├── Assignments/
│   ├── AssignmentCard.tsx
│   ├── AssignmentForm.tsx
│   ├── RubricBuilder.tsx
│   └── SubmissionList.tsx
├── Classes/
│   ├── ClassCard.tsx
│   ├── ClassForm.tsx
│   ├── StudentList.tsx
│   └── InviteStudents.tsx
├── UI/
│   ├── Button.tsx
│   ├── Modal.tsx
│   ├── LoadingSpinner.tsx
│   └── Toast.tsx
└── Charts/
    ├── UsageChart.tsx
    ├── ProgressChart.tsx
    └── AnalyticsChart.tsx
```

## 4. Key Workflow Diagrams

### Student Assignment Flow

```
1. Student logs in → Dashboard
2. Selects assignment → Assignment Canvas
3. Starts writing → Auto-save enabled
4. Requests AI help → AI interaction logged
5. Accepts/rejects suggestions → Usage tracked
6. Submits assignment → Status updated
7. Teacher reviews → Feedback provided
```

### AI Assistance Flow

```
1. Student highlights text/types request
2. System checks subscription limits
3. Sends context to AI API
4. AI generates suggestion
5. Displays suggestion with accept/reject
6. Logs interaction and token usage
7. Updates originality score
8. Saves to AI interactions collection
```

### Payment Integration Flow

```
1. User clicks upgrade → Stripe Checkout
2. Payment processed → Webhook triggered
3. Subscription status updated in DB
4. AI usage limits adjusted
5. User notified of upgrade
6. Access level updated immediately
```

## 5. Integration Points

### Firebase Integration

```javascript
// Authentication
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

// Cloud Functions for serverless processing
exports.processAIInteraction = functions.firestore
  .document('ai_interactions/{interactionId}')
  .onCreate(async (snap, context) => {
    // Log interaction, update usage stats
  });
```

### Stripe Integration

```javascript
// Subscription management
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Webhook handler
app.post('/api/payments/webhook', express.raw({type: 'application/json'}), (req, res) => {
  const sig = req.headers['stripe-signature'];
  const event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);

  switch (event.type) {
    case 'customer.subscription.created':
      // Update user subscription status
      break;
    case 'invoice.payment_succeeded':
      // Extend subscription, reset usage limits
      break;
  }
});
```

### AI API Integration

```javascript
// OpenAI/Anthropic integration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateSuggestion(prompt, context) {
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: "You are an educational writing assistant..." },
      { role: "user", content: `Context: ${context}\nRequest: ${prompt}` }
    ],
    max_tokens: 500
  });

  return response.choices[0].message.content;
}
```

## 6. Security Considerations

### Role-Based Access Control

```javascript
// Middleware for route protection
const checkRole = (allowedRoles) => {
  return async (req, res, next) => {
    const user = await getUserFromToken(req.headers.authorization);
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

// Usage
app.get('/api/admin/users', checkRole(['admin']), getUsers);
app.post('/api/assignments', checkRole(['teacher', 'admin']), createAssignment);
```

### Anti-Cheating Measures

```javascript
// AI usage tracking
const trackAIUsage = async (userId, submissionId, suggestion, accepted) => {
  await AIInteraction.create({
    userId,
    submissionId,
    suggestion,
    accepted,
    timestamp: new Date()
  });

  // Update submission AI percentage
  const submission = await Submission.findById(submissionId);
  submission.aiUsageStats.totalInteractions++;
  if (accepted) submission.aiUsageStats.suggestionsAccepted++;

  // Calculate new AI percentage
  submission.aiUsageStats.aiPercentage = calculateAIPercentage(submission);
  await submission.save();
};
```

### Data Protection

```javascript
// Input sanitization
const sanitizeInput = (input) => {
  return validator.escape(validator.trim(input));
};

// Rate limiting
const rateLimit = require('express-rate-limit');
const aiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 AI requests per windowMs
  message: 'Too many AI requests, please try again later'
});

app.use('/api/ai/', aiRateLimit);
```

## 7. Phased Implementation Roadmap

### Phase 1: MVP (4-6 weeks)

**Core Infrastructure**

- [ ] Firebase Authentication setup
- [ ] MongoDB database setup
- [ ] Basic user registration/login
- [ ] Role-based access control
- [ ] Basic assignment creation (teachers)
- [ ] Simple text editor for students
- [ ] Basic AI suggestion integration

**Deliverables:**

- Students can write assignments
- Teachers can create and view assignments
- Basic AI assistance (suggestions only)
- Simple subscription check (free/paid)

### Phase 2: Core Features (6-8 weeks)

**Enhanced Functionality**

- [ ] Stripe payment integration
- [ ] Rich text editor with formatting
- [ ] AI citation generator
- [ ] Auto-save functionality
- [ ] Class management system
- [ ] Assignment submission workflow
- [ ] Basic analytics dashboard

**Deliverables:**

- Full payment processing
- Complete assignment lifecycle
- Class invitation system
- AI usage tracking
- Teacher feedback system

### Phase 3: Advanced Features (8-10 weeks)

**Advanced AI & Analytics**

- [ ] "Humanize" AI feature
- [ ] Advanced AI usage analytics
- [ ] Originality scoring system
- [ ] Writing heatmap visualization
- [ ] Rubric alignment checker
- [ ] Advanced teacher dashboard
- [ ] Export functionality (PDF/Word)

**Deliverables:**

- Advanced AI assistance
- Comprehensive analytics
- Anti-cheating measures
- Professional export options

### Phase 4: Enterprise Features (6-8 weeks)

**Admin & Scale**

- [ ] Admin dashboard with full controls
- [ ] Advanced user management
- [ ] Revenue analytics
- [ ] System performance monitoring
- [ ] Advanced security features
- [ ] API rate limiting
- [ ] Bulk operations

**Deliverables:**

- Enterprise-ready platform
- Full administrative controls
- Scalable infrastructure
- Advanced security measures

### Technical Stack Summary

- **Frontend:** Next.js 14+, React 18+, TypeScript, Tailwind CSS
- **Backend:** Node.js, Express.js, MongoDB with Mongoose
- **Authentication:** Firebase Auth
- **Payments:** Stripe
- **AI:** OpenAI GPT-4 / Anthropic Claude
- **Hosting:** Vercel (frontend), Railway/Heroku (backend)
- **Database:** MongoDB Atlas
- **File Storage:** Firebase Storage

This architecture provides a scalable foundation for your AI Assignment Canvas platform with clear separation of concerns, comprehensive security measures, and a practical implementation roadmap.