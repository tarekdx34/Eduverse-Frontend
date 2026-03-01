# Phase 7: AI Features

> **Priority**: 🟢 Lower  
> **Modules**: 1  
> **Reason**: AI features enhance the learning experience but are not critical for core functionality.

---

## 7.1 AI Module

### Database Tables
| Table | Description |
|-------|-------------|
| `ai_summaries` | AI-generated content summaries |
| `ai_flashcards` | AI-generated study flashcards |
| `ai_quizzes` | AI-generated practice quizzes |
| `ai_feedback` | AI-generated performance feedback |
| `ai_recommendations` | AI study recommendations |
| `ai_study_plans` | AI-generated study plans |
| `ai_usage_statistics` | Tracking AI feature usage and costs |
| `ai_grading_results` | AI-generated grades and feedback |
| `chatbot_conversations` | AI chatbot conversation sessions |
| `chatbot_messages` | Individual messages in chatbot sessions |

### Entity Definitions

#### AiSummary Entity
```typescript
@Entity('ai_summaries')
export class AiSummary {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  summaryId: number;

  @Column({ type: 'bigint', unsigned: true })
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 50 })
  sourceType: string;  // 'material', 'lecture', 'chapter', 'notes'

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  sourceId: number;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text' })
  originalContent: string;

  @Column({ type: 'text' })
  summary: string;

  @Column({ type: 'enum', enum: ['brief', 'detailed', 'bullet_points', 'key_concepts'], default: 'detailed' })
  summaryType: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  aiModel: string;

  @Column({ type: 'int', nullable: true })
  tokensUsed: number;

  @CreateDateColumn()
  createdAt: Date;
}
```

#### AiFlashcard Entity
```typescript
@Entity('ai_flashcards')
export class AiFlashcard {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  flashcardId: number;

  @Column({ type: 'bigint', unsigned: true })
  userId: number;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  courseId: number;

  @Column({ length: 200, nullable: true })
  setTitle: string;

  @Column({ type: 'text' })
  front: string;  // Question side

  @Column({ type: 'text' })
  back: string;  // Answer side

  @Column({ type: 'varchar', length: 100, nullable: true })
  topic: string;

  @Column({ type: 'enum', enum: ['easy', 'medium', 'hard'], default: 'medium' })
  difficulty: string;

  @Column({ type: 'int', default: 0 })
  timesStudied: number;

  @Column({ type: 'int', default: 0 })
  timesCorrect: number;

  @Column({ type: 'tinyint', default: 0 })
  isBookmarked: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

#### AiStudyPlan Entity
```typescript
@Entity('ai_study_plans')
export class AiStudyPlan {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  planId: number;

  @Column({ type: 'bigint', unsigned: true })
  userId: number;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  courseId: number;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'json' })
  plan: any;  // Structured plan with daily/weekly tasks

  @Column({ type: 'date', nullable: true })
  startDate: string;

  @Column({ type: 'date', nullable: true })
  endDate: string;

  @Column({ type: 'enum', enum: ['active', 'completed', 'archived'], default: 'active' })
  status: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  completionPercent: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  aiModel: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

#### AiGradingResult Entity
```typescript
@Entity('ai_grading_results')
export class AiGradingResult {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  resultId: number;

  @Column({ type: 'bigint', unsigned: true })
  submissionId: number;

  @Column({ type: 'varchar', length: 50 })
  submissionType: string;  // 'assignment', 'quiz_essay', 'lab'

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  suggestedScore: number;

  @Column({ type: 'text' })
  suggestedFeedback: string;

  @Column({ type: 'json', nullable: true })
  rubricScores: any;  // Per-criteria scores

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  confidenceScore: number;  // 0-1

  @Column({ type: 'enum', enum: ['pending', 'accepted', 'modified', 'rejected'], default: 'pending' })
  reviewStatus: string;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  reviewedBy: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  aiModel: string;

  @Column({ type: 'int', nullable: true })
  tokensUsed: number;

  @CreateDateColumn()
  createdAt: Date;
}
```

#### ChatbotConversation Entity
```typescript
@Entity('chatbot_conversations')
export class ChatbotConversation {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  conversationId: number;

  @Column({ type: 'bigint', unsigned: true })
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ length: 200, nullable: true })
  title: string;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  courseId: number;

  @Column({ type: 'enum', enum: ['active', 'ended', 'archived'], default: 'active' })
  status: string;

  @Column({ type: 'int', default: 0 })
  messageCount: number;

  @Column({ type: 'int', default: 0 })
  totalTokensUsed: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

#### ChatbotMessage Entity
```typescript
@Entity('chatbot_messages')
export class ChatbotMessage {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  messageId: number;

  @Column({ type: 'bigint', unsigned: true })
  conversationId: number;

  @ManyToOne(() => ChatbotConversation)
  @JoinColumn({ name: 'conversation_id' })
  conversation: ChatbotConversation;

  @Column({ type: 'enum', enum: ['user', 'assistant', 'system'] })
  role: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'int', nullable: true })
  tokensUsed: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  aiModel: string;

  @CreateDateColumn()
  createdAt: Date;
}
```

#### AiUsageStatistics Entity
```typescript
@Entity('ai_usage_statistics')
export class AiUsageStatistics {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  statId: number;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  userId: number;

  @Column({ type: 'varchar', length: 50 })
  featureType: string;  // 'summary', 'flashcard', 'quiz_gen', 'grading', 'chatbot', 'study_plan'

  @Column({ type: 'varchar', length: 50 })
  aiModel: string;

  @Column({ type: 'int', default: 0 })
  tokensInput: number;

  @Column({ type: 'int', default: 0 })
  tokensOutput: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  cost: number;

  @Column({ type: 'int', nullable: true })
  responseTimeMs: number;

  @Column({ type: 'tinyint', default: 1 })
  success: boolean;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @CreateDateColumn()
  createdAt: Date;
}
```

### API Endpoints

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| **Content Generation** | | | |
| POST | `/api/ai/summarize` | Generate summary from content/material | ALL |
| POST | `/api/ai/flashcards` | Generate flashcards from content | ALL |
| POST | `/api/ai/quiz/generate` | Generate practice quiz from content | INSTRUCTOR, TA |
| POST | `/api/ai/notes/generate` | Generate study notes | STUDENT |
| POST | `/api/ai/study-plan` | Generate personalized study plan | STUDENT |
| **AI Grading** | | | |
| POST | `/api/ai/grade/:submissionType/:submissionId` | AI-grade a submission | INSTRUCTOR, TA |
| GET | `/api/ai/grading-results/:submissionId` | Get AI grading results | INSTRUCTOR, TA |
| PATCH | `/api/ai/grading-results/:id/review` | Accept/reject AI grade | INSTRUCTOR |
| POST | `/api/ai/grade/bulk` | Bulk AI-grade submissions | INSTRUCTOR |
| **Chatbot** | | | |
| GET | `/api/ai/chatbot/conversations` | List chatbot conversations | ALL |
| POST | `/api/ai/chatbot/conversations` | Start new conversation | ALL |
| GET | `/api/ai/chatbot/conversations/:id/messages` | Get conversation messages | ALL |
| POST | `/api/ai/chatbot/conversations/:id/message` | Send message to chatbot | ALL |
| DELETE | `/api/ai/chatbot/conversations/:id` | Delete conversation | ALL |
| **Feedback & Recommendations** | | | |
| GET | `/api/ai/feedback/:studentId` | Get AI-generated performance feedback | STUDENT (own), INSTRUCTOR |
| POST | `/api/ai/feedback/generate` | Generate feedback for student | INSTRUCTOR |
| GET | `/api/ai/recommendations` | Get AI study recommendations | STUDENT |
| **Flashcard Management** | | | |
| GET | `/api/ai/flashcards` | List user's flashcard sets | STUDENT |
| GET | `/api/ai/flashcards/:id` | Get flashcard details | STUDENT |
| PATCH | `/api/ai/flashcards/:id/study` | Record study attempt | STUDENT |
| PATCH | `/api/ai/flashcards/:id/bookmark` | Toggle bookmark | STUDENT |
| DELETE | `/api/ai/flashcards/:id` | Delete flashcard | STUDENT |
| **Study Plans** | | | |
| GET | `/api/ai/study-plans` | List user's study plans | STUDENT |
| GET | `/api/ai/study-plans/:id` | Get study plan details | STUDENT |
| PATCH | `/api/ai/study-plans/:id/progress` | Update plan progress | STUDENT |
| DELETE | `/api/ai/study-plans/:id` | Delete study plan | STUDENT |
| **Admin & Usage** | | | |
| GET | `/api/ai/usage-stats` | Get AI usage statistics | ADMIN, IT_ADMIN |
| GET | `/api/ai/usage-stats/by-feature` | Usage breakdown by feature | ADMIN, IT_ADMIN |
| GET | `/api/ai/usage-stats/by-user` | Usage breakdown by user | ADMIN, IT_ADMIN |
| GET | `/api/ai/models` | List available AI models | ADMIN, IT_ADMIN |
| PUT | `/api/ai/models/:id` | Update AI model config | IT_ADMIN |

### Business Logic
1. **AI Provider Abstraction**: Create an abstract `AiProviderService` that can be implemented for different AI providers (OpenAI, Google Gemini, etc.).
2. **Token Tracking**: Track tokens used per request for cost monitoring.
3. **Rate Limiting**: Limit AI requests per user per hour/day.
4. **Content Context**: When generating summaries/flashcards, provide course context for better results.
5. **Grading Review**: AI grades are suggestions. Instructor must review and accept/modify/reject.
6. **Flashcard Spaced Repetition**: Track study frequency and correctness for spaced repetition algorithms.
7. **Cost Management**: Monitor costs. Alert admins when usage exceeds thresholds.

### Frontend Components Using This Module
- **Student**: AIFeatures.tsx, AINotes.tsx, AIFeatures/ (subfolder) *(active as `ai` tab)*
- **TA**: AIAssistantPage.tsx *(active as `ai-assistant` tab)*
- ~~**Instructor**: AIToolsPage.tsx, ai-features/ (subfolder)~~ *(Removed from Instructor sidebar — task I10)*
- ~~**Admin**: AIInsightsPage.tsx~~ *(Not in Admin sidebar — deleted)*
- ~~**IT Admin**: AIManagementPage.tsx~~ *(Not in IT Admin sidebar — deleted)*

---

## Module Structure

```
src/modules/
└── ai/
    ├── ai.module.ts
    ├── entities/
    │   ├── ai-summary.entity.ts
    │   ├── ai-flashcard.entity.ts
    │   ├── ai-quiz.entity.ts
    │   ├── ai-feedback.entity.ts
    │   ├── ai-recommendation.entity.ts
    │   ├── ai-study-plan.entity.ts
    │   ├── ai-grading-result.entity.ts
    │   ├── ai-usage-statistics.entity.ts
    │   ├── chatbot-conversation.entity.ts
    │   └── chatbot-message.entity.ts
    ├── dto/
    │   ├── generate-summary.dto.ts
    │   ├── generate-flashcards.dto.ts
    │   ├── generate-quiz.dto.ts
    │   ├── generate-study-plan.dto.ts
    │   ├── grade-submission.dto.ts
    │   ├── chatbot-message.dto.ts
    │   └── query-usage.dto.ts
    ├── providers/
    │   ├── ai-provider.interface.ts       # Abstract interface
    │   ├── openai-provider.service.ts      # OpenAI implementation
    │   └── gemini-provider.service.ts      # Google Gemini implementation
    ├── controllers/
    │   ├── ai-content.controller.ts
    │   ├── ai-grading.controller.ts
    │   ├── ai-chatbot.controller.ts
    │   └── ai-admin.controller.ts
    ├── services/
    │   ├── ai-content.service.ts
    │   ├── ai-grading.service.ts
    │   ├── ai-chatbot.service.ts
    │   ├── ai-flashcard.service.ts
    │   ├── ai-study-plan.service.ts
    │   └── ai-usage.service.ts
    └── exceptions/
        ├── ai-provider-error.exception.ts
        └── ai-rate-limit.exception.ts
```
