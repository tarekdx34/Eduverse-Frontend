# Phase 11: Advanced Features

> **Priority**: 🔵 Nice-to-have  
> **Modules**: 7  
> **Reason**: These are supplementary features that enhance the platform but aren't critical for launch.

---

## 11.1 Study Groups Module

### Database Tables
| Table | Description |
|-------|-------------|
| `study_groups` | Student-created study groups |
| `study_group_members` | Study group membership |

### API Endpoints

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/study-groups` | List study groups (filter by course) | ALL |
| POST | `/api/study-groups` | Create study group | STUDENT |
| GET | `/api/study-groups/:id` | Get group details with members | ALL |
| PUT | `/api/study-groups/:id` | Update group | GROUP_OWNER |
| DELETE | `/api/study-groups/:id` | Delete group | GROUP_OWNER, ADMIN |
| POST | `/api/study-groups/:id/join` | Join group | STUDENT |
| DELETE | `/api/study-groups/:id/leave` | Leave group | STUDENT |
| POST | `/api/study-groups/:id/invite` | Invite user | GROUP_OWNER |
| GET | `/api/study-groups/my` | Get user's groups | STUDENT |

### Business Logic
1. **Max Members**: Configurable max group size.
2. **Course-linked**: Groups can be linked to specific courses.
3. **Privacy**: Public (anyone can join) or private (invite-only).
4. **Owner Transfer**: Allow ownership transfer to another member.

---

## 11.2 Peer Review Module

### Database Tables
| Table | Description |
|-------|-------------|
| `peer_reviews` | Peer review assignments and feedback |

### API Endpoints

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/peer-reviews/assignments` | List peer review assignments | STUDENT, INSTRUCTOR |
| POST | `/api/peer-reviews/assignments` | Create peer review assignment | INSTRUCTOR |
| GET | `/api/peer-reviews/my` | Get reviews assigned to me | STUDENT |
| POST | `/api/peer-reviews/:id/submit` | Submit peer review | STUDENT |
| GET | `/api/peer-reviews/received` | Get reviews received | STUDENT |
| GET | `/api/peer-reviews/assignment/:assignmentId/summary` | Get review summary | INSTRUCTOR |

### Business Logic
1. **Random Assignment**: Auto-assign reviewers (each submission reviewed by N peers).
2. **Anonymity**: Option for anonymous reviews.
3. **Rubric-based**: Use rubrics for structured feedback.
4. **Deadline**: Separate deadline for review submission.
5. **Feedback Quality**: Optional review of the reviewer's feedback quality.

---

## 11.3 Office Hours Module

### Database Tables
Uses `calendar_events` or new tables:

```sql
CREATE TABLE office_hour_slots (
  slot_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  instructor_id BIGINT UNSIGNED NOT NULL,
  day_of_week ENUM('monday','tuesday','wednesday','thursday','friday','saturday','sunday'),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location VARCHAR(200),
  meeting_type ENUM('in_person', 'online', 'hybrid') DEFAULT 'in_person',
  meeting_link VARCHAR(500),
  max_appointments INT DEFAULT 1,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE office_hour_appointments (
  appointment_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slot_id BIGINT UNSIGNED NOT NULL,
  student_id BIGINT UNSIGNED NOT NULL,
  appointment_date DATE NOT NULL,
  topic VARCHAR(200),
  notes TEXT,
  status ENUM('scheduled', 'completed', 'cancelled', 'no_show') DEFAULT 'scheduled',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### API Endpoints

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/office-hours/slots` | List available office hour slots | ALL |
| POST | `/api/office-hours/slots` | Create office hour slot | INSTRUCTOR, ADMIN, IT_ADMIN |
| PUT | `/api/office-hours/slots/:id` | Update slot | INSTRUCTOR, ADMIN, IT_ADMIN |
| DELETE | `/api/office-hours/slots/:id` | Delete slot | INSTRUCTOR, ADMIN, IT_ADMIN |
| GET | `/api/office-hours/appointments` | List appointments | INSTRUCTOR, ADMIN, IT_ADMIN |
| POST | `/api/office-hours/appointments` | Book appointment | STUDENT |
| PATCH | `/api/office-hours/appointments/:id` | Update appointment | STUDENT, INSTRUCTOR, ADMIN, IT_ADMIN |
| DELETE | `/api/office-hours/appointments/:id` | Cancel appointment | STUDENT, INSTRUCTOR, ADMIN, IT_ADMIN |
| GET | `/api/office-hours/my-appointments` | Get student's appointments | STUDENT |

### Frontend Components Using This Module
- **Instructor**: OfficeHoursPage (to be added to Instructor sidebar)
- **Admin**: Office Hours management (to be added to Admin sidebar)
- **IT Admin**: Office Hours oversight (to be added to IT Admin sidebar)
- ~~**TA**: OfficeHoursPage.tsx~~ *(Removed from TA sidebar — task T8)*

---

## 11.4 Live Sessions Module

### Database Tables
| Table | Description |
|-------|-------------|
| `live_sessions` | Live class/meeting sessions |
| `live_session_participants` | Participant tracking |

### API Endpoints

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/live-sessions` | List live sessions (filter by course, status) | ALL |
| POST | `/api/live-sessions` | Create live session | INSTRUCTOR |
| GET | `/api/live-sessions/:id` | Get session details | ALL |
| PUT | `/api/live-sessions/:id` | Update session | INSTRUCTOR |
| DELETE | `/api/live-sessions/:id` | Cancel session | INSTRUCTOR |
| POST | `/api/live-sessions/:id/join` | Join live session | ALL |
| POST | `/api/live-sessions/:id/leave` | Leave live session | ALL |
| GET | `/api/live-sessions/:id/participants` | List participants | INSTRUCTOR |
| PATCH | `/api/live-sessions/:id/start` | Start session | INSTRUCTOR |
| PATCH | `/api/live-sessions/:id/end` | End session | INSTRUCTOR |
| GET | `/api/live-sessions/:id/recording` | Get recording link | ALL |

### Business Logic
1. **Integration**: Support Zoom, Teams, Google Meet via API.
2. **Auto-create**: Generate meeting links automatically.
3. **Recording**: Store recording links after session ends.
4. **Attendance**: Auto-track participant join/leave times.
5. **Reminders**: Send reminders before live sessions.

---

## 11.5 Search Module

### Database Tables
| Table | Description |
|-------|-------------|
| `search_history` | User search query history |
| `search_index` | Full-text search index |

### API Endpoints

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/search` | Global search (courses, materials, users, discussions) | ALL |
| GET | `/api/search/suggestions` | Search autocomplete | ALL |
| GET | `/api/search/history` | Get user's search history | ALL |
| DELETE | `/api/search/history` | Clear search history | ALL |

### Query Parameters
```typescript
interface SearchDto {
  q: string;           // Search query
  type?: string;       // 'courses', 'materials', 'users', 'discussions', 'all'
  courseId?: number;    // Scope to specific course
  page?: number;
  limit?: number;
}
```

### Business Logic
1. **Full-text Search**: Use MySQL FULLTEXT indexes for content search.
2. **Multi-entity**: Search across courses, materials, discussions, users.
3. **Relevance Ranking**: Order results by relevance score.
4. **History**: Save search queries for autocomplete suggestions.
5. **Scoped Search**: Allow searching within a specific course.

### Frontend Components Using This Module
- ~~**Admin**: GlobalSearchPage.tsx~~ *(Not in Admin sidebar — deleted)*
- ~~**Instructor**: GlobalSearchPage.tsx~~ *(Removed from Instructor sidebar — task I16)*
- **Student**: GlobalSearch.tsx *(sub-component, not a standalone sidebar tab)*

---

## 11.6 Localization Module

### Database Tables
| Table | Description |
|-------|-------------|
| `content_translations` | Translated content for i18n |
| `localization_strings` | Translation strings by language |
| `language_preferences` | User language/format preferences |
| `theme_preferences` | User UI theme preferences |

### API Endpoints

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/localization/languages` | List available languages | ALL |
| GET | `/api/localization/strings/:lang` | Get translation strings for language | ALL |
| PUT | `/api/localization/strings/:lang` | Update translations | ADMIN |
| POST | `/api/localization/strings/:lang/import` | Import translation file | ADMIN |
| GET | `/api/localization/strings/:lang/export` | Export translations | ADMIN |
| GET | `/api/localization/content/:entityType/:entityId` | Get translated content | ALL |
| POST | `/api/localization/content` | Add content translation | ADMIN, INSTRUCTOR |

### Business Logic
1. **Fallback**: If translation doesn't exist, fall back to English.
2. **Import/Export**: Support JSON/CSV import/export of translation files.
3. **Content Translation**: Separate from UI translations. Translate course content.
4. **RTL Support**: Serve layout direction based on language.

---

## 11.7 Support & Feedback Module

### Database Tables
| Table | Description |
|-------|-------------|
| `support_tickets` | Support/issue tickets from users |
| `user_feedback` | User feedback and feature requests |
| `feedback_responses` | Responses to feedback/tickets |

### API Endpoints

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| **Support Tickets** | | | |
| GET | `/api/support/tickets` | List tickets (admin: all, user: own) | ALL |
| POST | `/api/support/tickets` | Create support ticket | ALL |
| GET | `/api/support/tickets/:id` | Get ticket details | ALL |
| PUT | `/api/support/tickets/:id` | Update ticket | ADMIN |
| PATCH | `/api/support/tickets/:id/status` | Change ticket status | ADMIN |
| POST | `/api/support/tickets/:id/respond` | Respond to ticket | ADMIN |
| **Feedback** | | | |
| GET | `/api/feedback` | List feedback | ADMIN |
| POST | `/api/feedback` | Submit feedback | ALL |
| GET | `/api/feedback/:id` | Get feedback details | ADMIN |
| POST | `/api/feedback/:id/respond` | Respond to feedback | ADMIN |
| GET | `/api/feedback/stats` | Feedback statistics | ADMIN |

### Business Logic
1. **Ticket Workflow**: `open` → `in_progress` → `waiting_on_user` → `resolved` → `closed`
2. **Priority**: `low`, `medium`, `high`, `urgent`
3. **Categories**: `technical`, `academic`, `billing`, `general`, `bug_report`, `feature_request`
4. **SLA**: Track response time against SLA thresholds.
5. **Auto-assignment**: Route tickets to relevant department.
6. **Satisfaction**: Request satisfaction rating after ticket closure.

### Frontend Components Using This Module
- ~~**Admin**: FeedbackSupportPage.tsx~~ *(Not in Admin sidebar — deleted)*
- **IT Admin**: FeedbackSupportPage.tsx ✅ *(Active in IT Admin sidebar as `feedback` tab)*

---

## Module Structure

```
src/modules/
├── study-groups/
│   ├── study-groups.module.ts
│   ├── entities/
│   ├── dto/
│   ├── controllers/
│   └── services/
├── peer-reviews/
│   ├── peer-reviews.module.ts
│   ├── entities/
│   ├── dto/
│   ├── controllers/
│   └── services/
├── office-hours/
│   ├── office-hours.module.ts
│   ├── entities/
│   ├── dto/
│   ├── controllers/
│   └── services/
├── live-sessions/
│   ├── live-sessions.module.ts
│   ├── entities/
│   ├── dto/
│   ├── controllers/
│   └── services/
├── search/
│   ├── search.module.ts
│   ├── entities/
│   ├── dto/
│   ├── controllers/
│   └── services/
├── localization/
│   ├── localization.module.ts
│   ├── entities/
│   ├── dto/
│   ├── controllers/
│   └── services/
└── support/
    ├── support.module.ts
    ├── entities/
    │   ├── support-ticket.entity.ts
    │   ├── user-feedback.entity.ts
    │   └── feedback-response.entity.ts
    ├── dto/
    ├── controllers/
    │   ├── support-tickets.controller.ts
    │   └── feedback.controller.ts
    └── services/
        ├── support-tickets.service.ts
        └── feedback.service.ts
```
