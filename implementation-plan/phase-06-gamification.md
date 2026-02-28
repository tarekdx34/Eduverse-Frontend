# Phase 6: Gamification & Student Engagement

> **Priority**: 🟢 Lower  
> **Modules**: 2  
> **Reason**: Enhances student motivation but not critical for core LMS functionality.

---

## 6.1 Gamification Module

### Database Tables
| Table | Description |
|-------|-------------|
| `achievements` | Achievement definitions with criteria |
| `badges` | Badge definitions and metadata |
| `user_badges` | Badges earned by users |
| `user_levels` | User gamification levels and XP tracking |
| `daily_streaks` | Learning streak tracking |
| `xp_transactions` | Experience points earned/spent |
| `leaderboards` | Leaderboard definitions |
| `leaderboard_rankings` | User rankings on leaderboards |
| `milestone_definitions` | Milestone thresholds for badges |
| `points_rules` | Rules for earning/spending points |
| `rewards` | Reward definitions |
| `reward_redemptions` | Reward redemption history |

### Entity Definitions

#### Badge Entity
```typescript
@Entity('badges')
export class Badge {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  badgeId: number;

  @Column({ length: 100 })
  badgeName: string;

  @Column({ type: 'text', nullable: true })
  badgeDescription: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  badgeImageUrl: string;

  @Column({ type: 'enum', enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'] })
  rarity: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  category: string;

  @Column({ type: 'tinyint', default: 1 })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
```

#### UserBadge Entity
```typescript
@Entity('user_badges')
export class UserBadge {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  userBadgeId: number;

  @Column({ type: 'bigint', unsigned: true })
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'int', unsigned: true })
  badgeId: number;

  @ManyToOne(() => Badge)
  @JoinColumn({ name: 'badge_id' })
  badge: Badge;

  @Column({ type: 'timestamp' })
  earnedAt: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  earnedContext: string;  // 'course_completion', 'quiz_perfect', etc.

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  contextId: number;

  @CreateDateColumn()
  createdAt: Date;
}
```

#### UserLevel Entity
```typescript
@Entity('user_levels')
export class UserLevel {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  userLevelId: number;

  @Column({ type: 'bigint', unsigned: true, unique: true })
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'int', default: 1 })
  currentLevel: number;

  @Column({ type: 'int', default: 0 })
  currentXp: number;

  @Column({ type: 'int', default: 100 })
  xpToNextLevel: number;

  @Column({ type: 'int', default: 0 })
  totalXpEarned: number;

  @Column({ type: 'int', default: 0 })
  totalPointsEarned: number;

  @Column({ type: 'int', default: 0 })
  totalPointsSpent: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  title: string;  // 'Novice', 'Scholar', 'Expert', etc.

  @UpdateDateColumn()
  updatedAt: Date;
}
```

#### DailyStreak Entity
```typescript
@Entity('daily_streaks')
export class DailyStreak {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  streakId: number;

  @Column({ type: 'bigint', unsigned: true })
  userId: number;

  @Column({ type: 'int', default: 0 })
  currentStreak: number;

  @Column({ type: 'int', default: 0 })
  longestStreak: number;

  @Column({ type: 'date', nullable: true })
  lastActivityDate: string;

  @Column({ type: 'date', nullable: true })
  streakStartDate: string;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

#### XpTransaction Entity
```typescript
@Entity('xp_transactions')
export class XpTransaction {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  transactionId: number;

  @Column({ type: 'bigint', unsigned: true })
  userId: number;

  @Column({ type: 'int' })
  amount: number;  // Positive for earned, negative for spent

  @Column({ type: 'enum', enum: ['earned', 'spent', 'bonus', 'penalty'] })
  transactionType: string;

  @Column({ type: 'varchar', length: 100 })
  source: string;  // 'assignment_complete', 'quiz_passed', 'streak_bonus', etc.

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  sourceId: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;
}
```

#### LeaderboardRanking Entity
```typescript
@Entity('leaderboard_rankings')
export class LeaderboardRanking {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  rankingId: number;

  @Column({ type: 'bigint', unsigned: true })
  leaderboardId: number;

  @Column({ type: 'bigint', unsigned: true })
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'int' })
  rank: number;

  @Column({ type: 'int', default: 0 })
  score: number;

  @Column({ type: 'int', default: 0 })
  previousRank: number;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### API Endpoints

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| **Profile** | | | |
| GET | `/api/gamification/profile` | Get current user's gamification profile (level, XP, streaks) | STUDENT |
| GET | `/api/gamification/profile/:userId` | Get any user's profile | INSTRUCTOR, ADMIN |
| **Achievements** | | | |
| GET | `/api/gamification/achievements` | List all achievements | ALL |
| GET | `/api/gamification/achievements/my` | Get user's earned achievements | STUDENT |
| GET | `/api/gamification/achievements/progress` | Get progress toward achievements | STUDENT |
| **Badges** | | | |
| GET | `/api/gamification/badges` | List all available badges | ALL |
| GET | `/api/gamification/badges/my` | Get user's earned badges | STUDENT |
| **Leaderboard** | | | |
| GET | `/api/gamification/leaderboard` | Get leaderboard (filter by course, global) | ALL |
| GET | `/api/gamification/leaderboard/my-rank` | Get current user's rank | STUDENT |
| **Streaks** | | | |
| GET | `/api/gamification/streaks` | Get user's streak info | STUDENT |
| **Rewards** | | | |
| GET | `/api/gamification/rewards` | List available rewards | STUDENT |
| POST | `/api/gamification/rewards/:id/redeem` | Redeem a reward | STUDENT |
| GET | `/api/gamification/rewards/my` | Get redemption history | STUDENT |
| **XP History** | | | |
| GET | `/api/gamification/xp/history` | Get XP transaction history | STUDENT |
| **Admin** | | | |
| POST | `/api/gamification/achievements` | Create achievement | ADMIN |
| POST | `/api/gamification/badges` | Create badge | ADMIN |
| POST | `/api/gamification/rewards` | Create reward | ADMIN |
| PUT | `/api/gamification/points-rules` | Update points rules | ADMIN |

### Query Parameters
```typescript
interface QueryLeaderboardDto {
  courseId?: number;
  sectionId?: number;
  period?: 'weekly' | 'monthly' | 'semester' | 'all_time';
  page?: number;
  limit?: number;
}
```

### Business Logic
1. **XP Awarding**: Auto-award XP when students complete activities:
   - Assignment submitted: +10 XP
   - Assignment graded A: +25 XP
   - Quiz passed: +15 XP
   - Quiz perfect score: +50 XP
   - Attendance present: +5 XP
   - Daily login streak: +10 XP × streak_days
2. **Level Progression**: XP thresholds increase per level (e.g., Level 1: 100 XP, Level 2: 250 XP, Level 3: 500 XP).
3. **Achievement Checking**: After each XP-triggering event, check if any achievement criteria are now met.
4. **Streak Tracking**: Reset streak if user misses a day. Record longest streak.
5. **Leaderboard Refresh**: Recalculate rankings periodically (every hour or on-demand).
6. **Reward Redemption**: Check user has enough points. Deduct points. Grant reward.

### Frontend Components Using This Module
- **Student**: Gamification.tsx

---

## 6.2 Tasks & Reminders Module

### Database Tables
| Table | Description |
|-------|-------------|
| `student_tasks` | Student task/todo tracking |
| `task_completion` | Task completion records |
| `deadline_reminders` | Assignment/task deadline reminders |

### Entity Definitions

#### StudentTask Entity
```typescript
@Entity('student_tasks')
export class StudentTask {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  taskId: number;

  @Column({ type: 'bigint', unsigned: true })
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: ['pending', 'in_progress', 'completed', 'cancelled'], default: 'pending' })
  status: string;

  @Column({ type: 'enum', enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' })
  priority: string;

  @Column({ type: 'timestamp', nullable: true })
  dueDate: Date;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  courseId: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  category: string;  // 'study', 'assignment', 'project', 'personal'

  @Column({ type: 'tinyint', default: 0 })
  isAutoGenerated: boolean;  // Auto-created from assignments/quizzes

  @Column({ type: 'varchar', length: 50, nullable: true })
  sourceType: string;  // 'assignment', 'quiz', 'lab'

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  sourceId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

#### DeadlineReminder Entity
```typescript
@Entity('deadline_reminders')
export class DeadlineReminder {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  reminderId: number;

  @Column({ type: 'bigint', unsigned: true })
  userId: number;

  @Column({ type: 'varchar', length: 50 })
  entityType: string;  // 'assignment', 'quiz', 'lab', 'task'

  @Column({ type: 'bigint', unsigned: true })
  entityId: number;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'timestamp' })
  deadline: Date;

  @Column({ type: 'timestamp' })
  reminderTime: Date;  // When to send the reminder

  @Column({ type: 'tinyint', default: 0 })
  isSent: boolean;

  @Column({ type: 'enum', enum: ['email', 'push', 'in_app'], default: 'in_app' })
  reminderType: string;

  @CreateDateColumn()
  createdAt: Date;
}
```

### API Endpoints

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/tasks` | List user's tasks (filter by status, priority, course) | STUDENT |
| POST | `/api/tasks` | Create a task | STUDENT |
| GET | `/api/tasks/:id` | Get task details | STUDENT |
| PATCH | `/api/tasks/:id` | Update task | STUDENT |
| PATCH | `/api/tasks/:id/complete` | Mark task as complete | STUDENT |
| DELETE | `/api/tasks/:id` | Delete task | STUDENT |
| GET | `/api/tasks/upcoming` | Get tasks due soon (next 7 days) | STUDENT |
| GET | `/api/reminders` | Get upcoming reminders | STUDENT |
| POST | `/api/reminders` | Create custom reminder | STUDENT |
| DELETE | `/api/reminders/:id` | Delete reminder | STUDENT |

### Business Logic
1. **Auto-generation**: When an assignment/quiz/lab is published, auto-create tasks for enrolled students.
2. **Smart Reminders**: Auto-create reminders at 1 day and 1 hour before deadlines.
3. **Priority Auto-Set**: Tasks with deadlines within 24 hours → `urgent`. Within 3 days → `high`.
4. **Completion Tracking**: Record completion time. Award XP via gamification module.
5. **Overdue Detection**: Mark tasks as overdue if past due date and not completed.

### Frontend Components Using This Module
- **Student**: SmartTodoReminder.tsx

---

## Module Structure

```
src/modules/
├── gamification/
│   ├── gamification.module.ts
│   ├── entities/
│   │   ├── achievement.entity.ts
│   │   ├── badge.entity.ts
│   │   ├── user-badge.entity.ts
│   │   ├── user-level.entity.ts
│   │   ├── daily-streak.entity.ts
│   │   ├── xp-transaction.entity.ts
│   │   ├── leaderboard.entity.ts
│   │   ├── leaderboard-ranking.entity.ts
│   │   ├── milestone-definition.entity.ts
│   │   ├── points-rule.entity.ts
│   │   ├── reward.entity.ts
│   │   └── reward-redemption.entity.ts
│   ├── dto/
│   ├── controllers/
│   │   └── gamification.controller.ts
│   ├── services/
│   │   ├── gamification.service.ts      (shared - exported for XP awarding)
│   │   ├── achievement.service.ts
│   │   ├── leaderboard.service.ts
│   │   └── reward.service.ts
│   └── exceptions/
└── tasks/
    ├── tasks.module.ts
    ├── entities/
    │   ├── student-task.entity.ts
    │   ├── task-completion.entity.ts
    │   └── deadline-reminder.entity.ts
    ├── dto/
    ├── controllers/
    │   └── tasks.controller.ts
    ├── services/
    │   ├── tasks.service.ts
    │   └── reminders.service.ts
    └── exceptions/
```
