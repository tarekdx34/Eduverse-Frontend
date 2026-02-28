# Phase 2: Communication & Collaboration

> **Priority**: 🟠 High  
> **Modules**: 5  
> **Reason**: Communication is essential for any LMS. Used by all dashboards.

---

## 2.1 Notifications Module

### Database Tables
| Table | Description |
|-------|-------------|
| `notifications` | In-app notifications to users |
| `notification_preferences` | User notification settings (email, push, in-app per category) |
| `scheduled_notifications` | Scheduled/queued notifications |

### Entity Definitions

#### Notification Entity
```typescript
@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  notificationId: number;

  @Column({ type: 'bigint', unsigned: true })
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'enum', enum: ['info', 'success', 'warning', 'error', 'assignment', 'grade', 'attendance', 'quiz', 'announcement', 'message', 'deadline', 'system'] })
  type: string;

  @Column({ type: 'enum', enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' })
  priority: string;

  @Column({ type: 'tinyint', default: 0 })
  isRead: boolean;

  @Column({ type: 'timestamp', nullable: true })
  readAt: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  entityType: string;  // 'assignment', 'quiz', 'course', etc.

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  entityId: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  actionUrl: string;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  senderId: number;

  @CreateDateColumn()
  createdAt: Date;
}
```

#### NotificationPreference Entity
```typescript
@Entity('notification_preferences')
export class NotificationPreference {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  preferenceId: number;

  @Column({ type: 'bigint', unsigned: true })
  userId: number;

  @Column({ type: 'varchar', length: 50 })
  category: string;  // 'assignments', 'grades', 'attendance', 'messages', 'system'

  @Column({ type: 'tinyint', default: 1 })
  emailEnabled: boolean;

  @Column({ type: 'tinyint', default: 1 })
  pushEnabled: boolean;

  @Column({ type: 'tinyint', default: 1 })
  inAppEnabled: boolean;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### API Endpoints

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/notifications` | List notifications (paginated, filtered) | ALL |
| GET | `/api/notifications/unread-count` | Get unread count | ALL |
| PATCH | `/api/notifications/:id/read` | Mark single notification as read | ALL |
| PATCH | `/api/notifications/read-all` | Mark all as read | ALL |
| DELETE | `/api/notifications/:id` | Delete notification | ALL |
| DELETE | `/api/notifications/clear-all` | Clear all notifications | ALL |
| GET | `/api/notifications/preferences` | Get notification preferences | ALL |
| PUT | `/api/notifications/preferences` | Update preferences | ALL |
| POST | `/api/notifications/send` | Send notification (admin/system) | ADMIN, IT_ADMIN |

### Query Parameters
```typescript
interface QueryNotificationsDto {
  type?: string;
  priority?: string;
  isRead?: boolean;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}
```

### Business Logic
1. **Auto-creation**: Notifications are automatically created by other modules (e.g., when an assignment is graded, when attendance is marked).
2. **Notification Service**: Provide a shared `NotificationService` that other modules can inject to create notifications.
3. **Batch Operations**: Support marking all as read and clearing all.
4. **Filtering**: By type, priority, read status, date range.

### Frontend Components Using This Module
- **All Dashboards**: NotificationsPage.tsx, NotificationCenter.tsx, AdminNotificationsPage.tsx

---

## 2.2 Messaging Module

### Database Tables
| Table | Description |
|-------|-------------|
| `messages` | Direct/group/announcement messages |
| `message_participants` | Message recipient tracking with read status |

### Entity Definitions

#### Message Entity
```typescript
@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  messageId: number;

  @Column({ type: 'bigint', unsigned: true })
  senderId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @Column({ type: 'enum', enum: ['direct', 'group', 'announcement', 'course'] })
  messageType: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  subject: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  parentMessageId: number;  // For threading

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  courseId: number;

  @Column({ type: 'json', nullable: true })
  attachments: any;

  @Column({ type: 'tinyint', default: 0 })
  isDeleted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => MessageParticipant, p => p.message)
  participants: MessageParticipant[];
}
```

#### MessageParticipant Entity
```typescript
@Entity('message_participants')
export class MessageParticipant {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  participantId: number;

  @Column({ type: 'bigint', unsigned: true })
  messageId: number;

  @ManyToOne(() => Message, m => m.participants)
  @JoinColumn({ name: 'message_id' })
  message: Message;

  @Column({ type: 'bigint', unsigned: true })
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'enum', enum: ['sender', 'recipient', 'cc', 'bcc'] })
  role: string;

  @Column({ type: 'tinyint', default: 0 })
  isRead: boolean;

  @Column({ type: 'timestamp', nullable: true })
  readAt: Date;

  @Column({ type: 'tinyint', default: 0 })
  isDeleted: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
```

### API Endpoints

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/messages/conversations` | List conversations (grouped by thread) | ALL |
| GET | `/api/messages/conversations/:id` | Get conversation messages | ALL |
| POST | `/api/messages` | Send a message | ALL |
| POST | `/api/messages/bulk` | Send to multiple recipients | INSTRUCTOR, ADMIN |
| PATCH | `/api/messages/:id/read` | Mark as read | ALL |
| DELETE | `/api/messages/:id` | Soft-delete message | ALL |
| GET | `/api/messages/unread-count` | Get unread count | ALL |
| GET | `/api/messages/search` | Search messages | ALL |

### Business Logic
1. **Conversations**: Group messages by thread (parentMessageId chain).
2. **Unread Count**: Track per-user read status via `message_participants`.
3. **Bulk Send**: Allow instructors to message all students in a section.
4. **Real-time** (future): WebSocket support for live messaging.
5. **Soft Delete**: Users can delete messages from their view without affecting others.

### Frontend Components Using This Module
- **Instructor**: CommunicationPage.tsx, MessagesPanel.tsx, MessageModal.tsx
- **Student**: MessagingChat.tsx
- **TA**: CommunicationPage.tsx

---

## 2.3 Announcements Module

### Database Tables
Uses `messages` table with `messageType = 'announcement'` OR a dedicated announcement system.

### Entity Definition
Can extend the Message entity or create a separate one. Recommended: Use messages table with announcement type.

### API Endpoints

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/announcements` | List announcements (filter by course, status) | ALL |
| POST | `/api/announcements` | Create announcement | INSTRUCTOR, TA, ADMIN |
| GET | `/api/announcements/:id` | Get announcement details | ALL |
| PUT | `/api/announcements/:id` | Update announcement | INSTRUCTOR, ADMIN |
| DELETE | `/api/announcements/:id` | Delete announcement | INSTRUCTOR, ADMIN |
| PATCH | `/api/announcements/:id/publish` | Publish draft announcement | INSTRUCTOR, ADMIN |
| PATCH | `/api/announcements/:id/schedule` | Schedule announcement for future | INSTRUCTOR, ADMIN |
| GET | `/api/announcements/:id/analytics` | View read counts, engagement | INSTRUCTOR, ADMIN |

### Business Logic
1. **Status Flow**: `draft` → `scheduled` → `published` → `archived`
2. **Scheduled Publishing**: Use `scheduled_notifications` table. Cron job publishes at scheduled time.
3. **Target Audience**: Can target specific sections, courses, or all students.
4. **Read Tracking**: Track which users have read the announcement.
5. **Priority**: Support priority levels for sorting.

### Frontend Components Using This Module
- **Instructor**: AnnouncementsManager.tsx, CommunicationPage.tsx
- **TA**: AnnouncementsPage.tsx
- **Admin**: AdminNotificationsPage.tsx

---

## 2.4 Discussions Module

### Database Tables
| Table | Description |
|-------|-------------|
| `course_chat_threads` | Discussion thread organization |
| `chat_messages` | Course discussion forum messages |

### Entity Definitions

#### CourseChatThread Entity
```typescript
@Entity('course_chat_threads')
export class CourseChatThread {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  threadId: number;

  @Column({ type: 'bigint', unsigned: true })
  sectionId: number;

  @ManyToOne(() => CourseSection)
  @JoinColumn({ name: 'section_id' })
  section: CourseSection;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'bigint', unsigned: true })
  createdBy: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  author: User;

  @Column({ type: 'enum', enum: ['open', 'answered', 'closed'], default: 'open' })
  status: string;

  @Column({ type: 'tinyint', default: 0 })
  isPinned: boolean;

  @Column({ type: 'tinyint', default: 0 })
  isLocked: boolean;

  @Column({ type: 'int', default: 0 })
  viewCount: number;

  @Column({ type: 'int', default: 0 })
  replyCount: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  category: string;  // 'general', 'question', 'assignment', 'lab', etc.

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => ChatMessage, m => m.thread)
  messages: ChatMessage[];
}
```

#### ChatMessage Entity
```typescript
@Entity('chat_messages')
export class ChatMessage {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  chatMessageId: number;

  @Column({ type: 'bigint', unsigned: true })
  threadId: number;

  @ManyToOne(() => CourseChatThread, t => t.messages)
  @JoinColumn({ name: 'thread_id' })
  thread: CourseChatThread;

  @Column({ type: 'bigint', unsigned: true })
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  parentMessageId: number;  // For nested replies

  @Column({ type: 'tinyint', default: 0 })
  isAnswer: boolean;  // Marked as accepted answer

  @Column({ type: 'int', default: 0 })
  likeCount: number;

  @Column({ type: 'json', nullable: true })
  attachments: any;

  @Column({ type: 'tinyint', default: 0 })
  isDeleted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### API Endpoints

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/discussions` | List discussions (filter by section, status, category) | ALL |
| POST | `/api/discussions` | Create discussion thread | ALL |
| GET | `/api/discussions/:id` | Get discussion with replies | ALL |
| PUT | `/api/discussions/:id` | Update discussion | AUTHOR, INSTRUCTOR, ADMIN |
| DELETE | `/api/discussions/:id` | Delete discussion | AUTHOR, INSTRUCTOR, ADMIN |
| POST | `/api/discussions/:id/reply` | Post reply to discussion | ALL |
| PATCH | `/api/discussions/:id/pin` | Pin/unpin discussion | INSTRUCTOR, TA |
| PATCH | `/api/discussions/:id/lock` | Lock/unlock discussion | INSTRUCTOR, TA |
| PATCH | `/api/discussions/:id/close` | Close discussion | INSTRUCTOR, TA, AUTHOR |
| PATCH | `/api/discussions/replies/:replyId/mark-answer` | Mark reply as answer | INSTRUCTOR, TA, THREAD_AUTHOR |
| POST | `/api/discussions/replies/:replyId/like` | Like a reply | ALL |

### Business Logic
1. **Thread Status**: Auto-change to `answered` when a reply is marked as answer.
2. **View Count**: Increment on each unique view.
3. **Reply Count**: Auto-update when replies are added.
4. **Pinning**: Pinned threads appear first in listings.
5. **Locking**: Locked threads cannot receive new replies.

### Frontend Components Using This Module
- **Instructor**: DiscussionPage.tsx
- **Student**: CourseCommunity.tsx
- **TA**: DiscussionPage.tsx

---

## 2.5 Community Module

### Database Tables
| Table | Description |
|-------|-------------|
| `community_posts` | Community forum discussion posts |
| `community_post_comments` | Comments on forum posts |
| `community_post_reactions` | Emoji reactions to posts |
| `forum_categories` | Forum category organization |

### API Endpoints

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/community/categories` | List forum categories | ALL |
| GET | `/api/community/posts` | List posts (filter by category, course) | ALL |
| POST | `/api/community/posts` | Create post | ALL |
| GET | `/api/community/posts/:id` | Get post with comments | ALL |
| PUT | `/api/community/posts/:id` | Update post | AUTHOR, ADMIN |
| DELETE | `/api/community/posts/:id` | Delete post | AUTHOR, ADMIN |
| POST | `/api/community/posts/:id/comment` | Add comment | ALL |
| PUT | `/api/community/comments/:id` | Update comment | AUTHOR |
| DELETE | `/api/community/comments/:id` | Delete comment | AUTHOR, ADMIN |
| POST | `/api/community/posts/:id/react` | Add/remove reaction | ALL |
| PATCH | `/api/community/posts/:id/pin` | Pin/unpin post | INSTRUCTOR, ADMIN |

### Business Logic
1. **Reactions**: Support multiple emoji types per post. Toggle on/off.
2. **Comment Threading**: Support nested comments.
3. **Moderation**: Admins and instructors can pin, delete, or moderate posts.
4. **Category Filtering**: Posts organized by forum categories.
5. **Trending**: Sort by recent activity, most likes, most comments.

### Frontend Components Using This Module
- **Student**: CourseCommunity.tsx

---

## Module Structure (All Phase 2 Modules)

```
src/modules/
├── notifications/
│   ├── notifications.module.ts
│   ├── entities/
│   │   ├── notification.entity.ts
│   │   ├── notification-preference.entity.ts
│   │   └── scheduled-notification.entity.ts
│   ├── dto/
│   ├── controllers/
│   ├── services/
│   │   └── notifications.service.ts   (shared - exported for other modules)
│   └── exceptions/
├── messaging/
│   ├── messaging.module.ts
│   ├── entities/
│   │   ├── message.entity.ts
│   │   └── message-participant.entity.ts
│   ├── dto/
│   ├── controllers/
│   ├── services/
│   └── exceptions/
├── announcements/
│   ├── announcements.module.ts
│   ├── dto/
│   ├── controllers/
│   ├── services/
│   └── exceptions/
├── discussions/
│   ├── discussions.module.ts
│   ├── entities/
│   │   ├── course-chat-thread.entity.ts
│   │   └── chat-message.entity.ts
│   ├── dto/
│   ├── controllers/
│   ├── services/
│   └── exceptions/
└── community/
    ├── community.module.ts
    ├── entities/
    │   ├── community-post.entity.ts
    │   ├── community-comment.entity.ts
    │   ├── community-reaction.entity.ts
    │   └── forum-category.entity.ts
    ├── dto/
    ├── controllers/
    ├── services/
    └── exceptions/
```
