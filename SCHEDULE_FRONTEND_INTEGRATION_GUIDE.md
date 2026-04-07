# EduVerse Schedule System - Frontend Integration Guide

**Date:** 2026-04-07  
**Backend Version:** v2.0 - Schedule System Enhancement  
**API Base URL:** `http://localhost:8081/api`

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Campus Events API](#campus-events-api)
4. [Schedule Templates API](#schedule-templates-api)
5. [Enhanced Schedule API](#enhanced-schedule-api)
6. [Office Hours API](#office-hours-api)
7. [Common Patterns](#common-patterns)
8. [Error Handling](#error-handling)
9. [TypeScript Interfaces](#typescript-interfaces)

---

## Overview

The Schedule System Enhancement adds:
- **Campus Events** - University-wide and department-level events
- **Schedule Templates** - Reusable patterns for bulk course scheduling
- **Enhanced Schedule Views** - Unified view including campus events
- **Smart Office Hours** - Conflict detection and auto-suggestions

### Key Features
✅ Role-based visibility filtering  
✅ Pagination on all list endpoints  
✅ Comprehensive search and filtering  
✅ Conflict detection  
✅ Bulk operations for admins

---

## Authentication

All endpoints require JWT authentication via Bearer token.

```typescript
// Request Headers
{
  "Authorization": "Bearer <your_jwt_token>",
  "Content-Type": "application/json"
}
```

### Role-Based Access

| Role | Campus Events | Schedule Templates | Office Hours Suggest | Admin Dashboard |
|------|--------------|-------------------|---------------------|-----------------|
| **Student** | View | View (university-wide) | ✅ | ❌ |
| **Instructor** | View | View (university-wide) | ✅ | ❌ |
| **TA** | View | View (university-wide) | ✅ | ❌ |
| **Department Head** | Create (dept) | Create/Apply (dept) | ✅ | ✅ (dept only) |
| **Admin** | Create (all) | Create/Apply (all) | ✅ | ✅ (all) |

---

## Campus Events API

Base Path: `/api/campus-events`

### 1. List Campus Events

**Endpoint:** `GET /api/campus-events`

**Query Parameters:**
```typescript
{
  eventType?: 'university_wide' | 'department' | 'campus' | 'program';
  scopeId?: number;  // Department/campus/program ID
  status?: 'draft' | 'published' | 'cancelled' | 'completed';
  fromDate?: string;  // YYYY-MM-DD
  toDate?: string;    // YYYY-MM-DD
  tag?: string;
  search?: string;
  page?: number;      // Default: 1
  limit?: number;     // Default: 10
}
```

**Response:**
```typescript
{
  data: CampusEvent[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface CampusEvent {
  eventId: number;
  title: string;
  description: string | null;
  eventType: 'university_wide' | 'department' | 'campus' | 'program';
  scopeId: number | null;
  startDatetime: string;  // ISO 8601
  endDatetime: string;    // ISO 8601
  location: string | null;
  building: string | null;
  room: string | null;
  organizerId: number;
  organizer: {
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  isMandatory: boolean;
  registrationRequired: boolean;
  maxAttendees: number | null;
  color: string;  // Hex color for calendar
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  tags: string[] | null;
  createdAt: string;
  updatedAt: string;
  // Extended fields
  userRegistration?: {
    registrationId: number;
    status: 'registered' | 'attended' | 'cancelled' | 'no_show';
    registeredAt: string;
  } | null;
  registrationCount: number;
  spotsRemaining: number | null;
}
```

**Example Request:**
```bash
curl -X GET "http://localhost:8081/api/campus-events?status=published&fromDate=2026-04-01&page=1&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Example Response:**
```json
{
  "data": [
    {
      "eventId": 1,
      "title": "Spring Fun Day",
      "description": "Annual spring celebration with activities, food, and entertainment.",
      "eventType": "university_wide",
      "scopeId": null,
      "startDatetime": "2026-04-20T10:00:00Z",
      "endDatetime": "2026-04-20T17:00:00Z",
      "location": "Main Campus Grounds",
      "building": "Outdoor",
      "room": null,
      "organizerId": 1,
      "organizer": {
        "userId": 1,
        "firstName": "Admin",
        "lastName": "User",
        "email": "admin@example.com"
      },
      "isMandatory": false,
      "registrationRequired": false,
      "maxAttendees": null,
      "color": "#F59E0B",
      "status": "published",
      "tags": ["social", "campus-life"],
      "userRegistration": null,
      "registrationCount": 0,
      "spotsRemaining": null,
      "createdAt": "2026-03-15T10:00:00Z",
      "updatedAt": "2026-03-15T10:00:00Z"
    }
  ],
  "meta": {
    "total": 4,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

---

### 2. Get My Campus Events

**Endpoint:** `GET /api/campus-events/my`

Returns published events visible to current user from today onwards.

**Response:** Same as List Campus Events

---

### 3. Get Campus Event Details

**Endpoint:** `GET /api/campus-events/:id`

**Path Parameters:**
- `id` (number) - Event ID

**Response:** Single `CampusEvent` object (same structure as list)

---

### 4. Create Campus Event

**Endpoint:** `POST /api/campus-events`

**Roles:** Admin, IT_Admin, Department_Head

**Request Body:**
```typescript
{
  title: string;                    // Required, max 255
  description?: string;
  eventType: 'university_wide' | 'department' | 'campus' | 'program';  // Required
  scopeId?: number;                 // Required for non-university_wide
  startDatetime: string;            // Required, ISO 8601
  endDatetime: string;              // Required, ISO 8601
  location?: string;
  building?: string;
  room?: string;
  isMandatory?: boolean;
  registrationRequired?: boolean;
  maxAttendees?: number;
  color?: string;                   // Hex color, default: #10B981
  status?: 'draft' | 'published' | 'cancelled' | 'completed';
  tags?: string[];
}
```

**Example Request:**
```bash
curl -X POST "http://localhost:8081/api/campus-events" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Career Fair 2026",
    "description": "Annual career fair with 50+ companies",
    "eventType": "university_wide",
    "startDatetime": "2026-04-25T09:00:00Z",
    "endDatetime": "2026-04-25T16:00:00Z",
    "location": "Sports Complex Hall",
    "registrationRequired": false,
    "status": "published",
    "tags": ["career", "networking"]
  }'
```

**Response:** Created `CampusEvent` object

---

### 5. Update Campus Event

**Endpoint:** `PUT /api/campus-events/:id`

**Roles:** Admin, IT_Admin, Event Organizer

**Request Body:** Same as Create (all fields optional)

**Response:** Updated `CampusEvent` object

---

### 6. Delete Campus Event

**Endpoint:** `DELETE /api/campus-events/:id`

**Roles:** Admin, IT_Admin, Event Organizer

**Response:**
```json
{
  "message": "Campus event deleted successfully"
}
```

---

### 7. Register for Event

**Endpoint:** `POST /api/campus-events/:id/register`

**Roles:** ALL

**Request Body:**
```typescript
{
  notes?: string;  // Optional registration notes, max 500 chars
}
```

**Response:**
```typescript
{
  registrationId: number;
  eventId: number;
  userId: number;
  status: 'registered';
  notes: string | null;
  registeredAt: string;
  updatedAt: string;
}
```

**Validation:**
- Event must require registration
- Event must be published
- User cannot be already registered
- Event must have available capacity

---

### 8. Unregister from Event

**Endpoint:** `DELETE /api/campus-events/:id/register`

**Response:**
```json
{
  "message": "Successfully unregistered from event"
}
```

---

### 9. Get Event Registrations

**Endpoint:** `GET /api/campus-events/:id/registrations`

**Roles:** Admin, IT_Admin, Event Organizer

**Response:**
```typescript
{
  event: CampusEvent;
  registrations: Array<{
    registrationId: number;
    userId: number;
    user: {
      userId: number;
      firstName: string;
      lastName: string;
      email: string;
    };
    status: 'registered' | 'attended' | 'cancelled' | 'no_show';
    notes: string | null;
    registeredAt: string;
    updatedAt: string;
  }>;
  summary: {
    total: number;
    registered: number;
    attended: number;
    cancelled: number;
    noShow: number;
  };
}
```

---

## Schedule Templates API

Base Path: `/api/schedule-templates`

### 1. List Templates

**Endpoint:** `GET /api/schedule-templates`

**Query Parameters:**
```typescript
{
  scheduleType?: 'LECTURE' | 'LAB' | 'TUTORIAL' | 'HYBRID';
  departmentId?: number;  // null for university-wide
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}
```

**Response:**
```typescript
{
  data: ScheduleTemplate[];
  meta: PaginationMeta;
}

interface ScheduleTemplate {
  templateId: number;
  name: string;
  description: string | null;
  departmentId: number | null;
  department: {
    departmentId: number;
    departmentName: string;
  } | null;
  scheduleType: 'LECTURE' | 'LAB' | 'TUTORIAL' | 'HYBRID';
  createdBy: number;
  creator: {
    userId: number;
    firstName: string;
    lastName: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  slots: TemplateSlot[];
}

interface TemplateSlot {
  slotId: number;
  templateId: number;
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  startTime: string;  // HH:MM:SS
  endTime: string;    // HH:MM:SS
  slotType: 'LECTURE' | 'LAB' | 'TUTORIAL' | 'EXAM';
  durationMinutes: number;
  building: string | null;
  room: string | null;
}
```

---

### 2. Get Template Details

**Endpoint:** `GET /api/schedule-templates/:id`

**Response:** Single `ScheduleTemplate` object with `slots` array ordered by day and time

---

### 3. Create Template

**Endpoint:** `POST /api/schedule-templates`

**Roles:** Admin, IT_Admin, Department_Head

**Request Body:**
```typescript
{
  name: string;                           // Required
  description?: string;
  departmentId?: number;                  // null = university-wide
  scheduleType: 'LECTURE' | 'LAB' | 'TUTORIAL' | 'HYBRID';  // Required
  isActive?: boolean;                     // Default: true
  slots: Array<{                          // Required, min 1 slot
    dayOfWeek: 'MONDAY' | 'TUESDAY' | ...;
    startTime: string;                    // HH:MM:SS
    endTime: string;                      // HH:MM:SS
    slotType: 'LECTURE' | 'LAB' | 'TUTORIAL';
    building?: string;
    room?: string;
  }>;
}
```

**Example Request:**
```bash
curl -X POST "http://localhost:8081/api/schedule-templates" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "MW 2-Hour Lecture Pattern",
    "description": "Standard Monday-Wednesday 2-hour lecture",
    "scheduleType": "LECTURE",
    "isActive": true,
    "slots": [
      {
        "dayOfWeek": "MONDAY",
        "startTime": "09:00:00",
        "endTime": "11:00:00",
        "slotType": "LECTURE"
      },
      {
        "dayOfWeek": "WEDNESDAY",
        "startTime": "09:00:00",
        "endTime": "11:00:00",
        "slotType": "LECTURE"
      }
    ]
  }'
```

**Response:** Created `ScheduleTemplate` object

---

### 4. Update Template

**Endpoint:** `PUT /api/schedule-templates/:id`

**Roles:** Admin, IT_Admin, Template Creator

**Request Body:** Partial update (all fields optional except slots - to modify slots, delete and recreate)

**Response:** Updated template

---

### 5. Delete Template

**Endpoint:** `DELETE /api/schedule-templates/:id`

**Response:**
```json
{
  "message": "Schedule template deleted successfully"
}
```

**Note:** Does not affect existing course schedules created from this template.

---

### 6. Apply Template to Section

**Endpoint:** `POST /api/schedule-templates/apply`

**Roles:** Admin, IT_Admin, Department_Head

**Request Body:**
```typescript
{
  templateId: number;      // Required
  sectionId: number;       // Required
  building?: string;       // Override template building
  room?: string;           // Override template room
}
```

**Response:**
```json
{
  "message": "Schedule template applied successfully",
  "sectionId": 1,
  "schedulesCreated": 2
}
```

**Behavior:**
1. Deletes all existing schedules for the section
2. Creates new schedules from template slots
3. Uses building/room from request if provided, otherwise from template

---

### 7. Bulk Apply Template

**Endpoint:** `POST /api/schedule-templates/apply/bulk`

**Roles:** Admin, IT_Admin, Department_Head

**Request Body:**
```typescript
{
  templateId: number;
  sectionIds: number[];      // Array of section IDs
  building?: string;
  room?: string;
}
```

**Response:**
```typescript
{
  message: string;
  successful: number;
  failed: number;
  results: Array<{
    sectionId: number;
    status: 'success';
  }>;
  errors: Array<{
    sectionId: number;
    status: 'error';
    message: string;
  }>;
}
```

**Example:**
```json
{
  "message": "Bulk template application completed",
  "successful": 8,
  "failed": 2,
  "results": [
    { "sectionId": 1, "status": "success" },
    { "sectionId": 2, "status": "success" }
  ],
  "errors": [
    {
      "sectionId": 99,
      "status": "error",
      "message": "Course section with ID 99 not found"
    }
  ]
}
```

---

## Enhanced Schedule API

Base Path: `/api/schedule`

### 1. Get Daily Schedule

**Endpoint:** `GET /api/schedule/my/daily`

**Query Parameters:**
```typescript
{
  date?: string;  // YYYY-MM-DD, defaults to today
}
```

**Response:**
```typescript
{
  date: string;         // YYYY-MM-DD
  dayOfWeek: string;    // MONDAY, TUESDAY, etc.
  schedules: Array<{    // Class schedules
    type: 'class';
    id: number;
    sectionId: number;
    dayOfWeek: string;
    startTime: string;   // HH:MM:SS
    endTime: string;
    room: string | null;
    building: string | null;
    scheduleType: 'LECTURE' | 'LAB' | 'TUTORIAL' | 'EXAM';
    section: {
      id: number;
      sectionNumber: string;
      course: {
        courseId: number;
        courseCode: string;
        courseName: string;
      };
    };
  }>;
  events: Array<{      // Personal calendar events
    type: 'event';
    eventId: number;
    title: string;
    description: string | null;
    eventType: string;
    startTime: string;  // ISO 8601
    endTime: string;
    location: string | null;
    color: string;
    course: Course | null;
  }>;
  exams: Array<{       // Exam schedules
    type: 'exam';
    examId: number;
    courseId: number;
    examType: 'midterm' | 'final' | 'quiz' | 'makeup';
    title: string | null;
    examDate: string;   // YYYY-MM-DD
    startTime: string;  // HH:MM:SS
    durationMinutes: number;
    location: string | null;
    course: Course;
  }>;
  campusEvents: Array<{  // Campus events (NEW)
    type: 'campus_event';
    eventId: number;
    title: string;
    description: string | null;
    eventType: string;
    startDatetime: string;
    endDatetime: string;
    location: string | null;
    color: string;
    isMandatory: boolean;
    registrationRequired: boolean;
  }>;
}
```

**Example Request:**
```bash
curl -X GET "http://localhost:8081/api/schedule/my/daily?date=2026-04-20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Usage Notes:**
- Returns ALL schedule items for the day in separate arrays
- Items can overlap (campus events don't block other items)
- Use `type` field to distinguish item types
- Frontend should merge and sort by time for display

---

### 2. Get Weekly Schedule

**Endpoint:** `GET /api/schedule/my/weekly`

**Query Parameters:**
```typescript
{
  startDate?: string;  // YYYY-MM-DD, defaults to start of current week (Monday)
}
```

**Response:**
```typescript
{
  weekStart: string;     // YYYY-MM-DD
  weekEnd: string;       // YYYY-MM-DD
  days: Array<DailySchedule>;  // 7 days (same structure as daily)
}
```

---

### 3. Get Schedule Range

**Endpoint:** `GET /api/schedule/range`

**Query Parameters:**
```typescript
{
  startDate?: string;   // YYYY-MM-DD
  endDate?: string;     // YYYY-MM-DD
  eventType?: string;   // Filter events by type
  courseId?: number;    // Filter by course
}
```

**Response:**
```typescript
{
  startDate: string;
  endDate: string;
  events: CalendarEvent[];
  exams: ExamSchedule[];
}
```

---

## Office Hours API

Base Path: `/api/office-hours`

### Get Smart Slot Suggestions

**Endpoint:** `GET /api/office-hours/slots/suggest`

**Query Parameters:**
```typescript
{
  instructorId?: number;  // Filter by instructor
  fromDate?: string;      // YYYY-MM-DD
  toDate?: string;        // YYYY-MM-DD
}
```

**Response:**
```typescript
{
  suggestions: Array<{
    slot: {
      slotId: number;
      instructorId: number;
      dayOfWeek: string;
      startTime: string;
      endTime: string;
      location: string;
      mode: 'in_person' | 'online' | 'hybrid';
      maxAppointments: number;
      currentAppointments: number;
    };
    score: number;              // 0-100, higher is better
    conflicts: Array<{
      type: 'class' | 'exam' | 'campus_event' | 'appointment';
      title: string;
      startTime: string;
      endTime: string;
      severity: 'hard' | 'soft';
    }>;
    recommendation: 'best' | 'good' | 'has_conflicts';
  }>;
}
```

**Scoring Logic:**
- **Best (90-100)**: No conflicts, close to student's classes, high availability
- **Good (70-89)**: Minor conflicts or moderate distance from classes
- **Has Conflicts (<70)**: Overlaps with student's schedule

---

## Common Patterns

### Pagination

All list endpoints support pagination:

```typescript
// Request
GET /api/campus-events?page=2&limit=20

// Response
{
  data: [...],
  meta: {
    total: 150,
    page: 2,
    limit: 20,
    totalPages: 8
  }
}
```

**Frontend Implementation:**
```typescript
const fetchEvents = async (page: number, limit: number = 20) => {
  const response = await axios.get(`/api/campus-events`, {
    params: { page, limit, status: 'published' },
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};
```

---

### Filtering & Search

Combine multiple filters:

```typescript
GET /api/campus-events?eventType=department&scopeId=1&status=published&fromDate=2026-04-01&search=workshop
```

---

### Date & Time Formatting

**Dates:** Use `YYYY-MM-DD` format (e.g., `2026-04-20`)  
**Times:** Use `HH:MM:SS` format (e.g., `09:00:00`)  
**Datetimes:** Use ISO 8601 format (e.g., `2026-04-20T09:00:00Z`)

**Frontend Helpers:**
```typescript
// Format date for API
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Format datetime for API
const formatDatetime = (date: Date): string => {
  return date.toISOString();
};

// Parse API datetime to local
const parseDateTime = (datetime: string): Date => {
  return new Date(datetime);
};
```

---

## Error Handling

### Standard Error Response

```typescript
{
  statusCode: number;
  message: string | string[];
  error: string;
}
```

**Common Status Codes:**

| Code | Error | Meaning |
|------|-------|---------|
| 400 | Bad Request | Invalid input data or business rule violation |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Schedule conflict or duplicate registration |
| 500 | Internal Server Error | Server error |

**Example Error Response:**
```json
{
  "statusCode": 400,
  "message": "Event is at maximum capacity",
  "error": "Bad Request"
}
```

**Frontend Error Handling:**
```typescript
try {
  const response = await axios.post('/api/campus-events/1/register', data, {
    headers: { Authorization: `Bearer ${token}` }
  });
} catch (error) {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const message = error.response?.data?.message;
    
    switch (status) {
      case 400:
        showToast('error', message);
        break;
      case 401:
        redirectToLogin();
        break;
      case 403:
        showToast('error', 'You do not have permission to perform this action');
        break;
      case 404:
        showToast('error', 'Event not found');
        break;
      default:
        showToast('error', 'An unexpected error occurred');
    }
  }
}
```

---

## TypeScript Interfaces

### Complete Type Definitions

```typescript
// Campus Events
export interface CampusEvent {
  eventId: number;
  title: string;
  description: string | null;
  eventType: 'university_wide' | 'department' | 'campus' | 'program';
  scopeId: number | null;
  startDatetime: string;
  endDatetime: string;
  location: string | null;
  building: string | null;
  room: string | null;
  organizerId: number;
  organizer: UserBasic;
  isMandatory: boolean;
  registrationRequired: boolean;
  maxAttendees: number | null;
  color: string;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  tags: string[] | null;
  createdAt: string;
  updatedAt: string;
  userRegistration?: CampusEventRegistration | null;
  registrationCount: number;
  spotsRemaining: number | null;
}

export interface CampusEventRegistration {
  registrationId: number;
  eventId: number;
  userId: number;
  status: 'registered' | 'attended' | 'cancelled' | 'no_show';
  notes: string | null;
  registeredAt: string;
  updatedAt: string;
}

// Schedule Templates
export interface ScheduleTemplate {
  templateId: number;
  name: string;
  description: string | null;
  departmentId: number | null;
  department: Department | null;
  scheduleType: 'LECTURE' | 'LAB' | 'TUTORIAL' | 'HYBRID';
  createdBy: number;
  creator: UserBasic;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  slots: TemplateSlot[];
}

export interface TemplateSlot {
  slotId: number;
  templateId: number;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  slotType: 'LECTURE' | 'LAB' | 'TUTORIAL' | 'EXAM';
  durationMinutes: number;
  building: string | null;
  room: string | null;
}

// Schedule Items
export interface DailySchedule {
  date: string;
  dayOfWeek: string;
  schedules: ClassSchedule[];
  events: CalendarEvent[];
  exams: ExamSchedule[];
  campusEvents: CampusEventScheduleItem[];
}

export interface ClassSchedule {
  type: 'class';
  id: number;
  sectionId: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room: string | null;
  building: string | null;
  scheduleType: 'LECTURE' | 'LAB' | 'TUTORIAL' | 'EXAM';
  section: {
    id: number;
    sectionNumber: string;
    course: CourseBasic;
  };
}

export interface CampusEventScheduleItem {
  type: 'campus_event';
  eventId: number;
  title: string;
  description: string | null;
  eventType: string;
  startDatetime: string;
  endDatetime: string;
  location: string | null;
  color: string;
  isMandatory: boolean;
  registrationRequired: boolean;
}

// Common
export interface UserBasic {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Department {
  departmentId: number;
  departmentName: string;
}

export interface CourseBasic {
  courseId: number;
  courseCode: string;
  courseName: string;
}

export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// API Service Classes
export class CampusEventsService {
  private baseURL = '/api/campus-events';
  
  async list(params: CampusEventQueryParams): Promise<PaginatedResponse<CampusEvent>> {
    const response = await axios.get(this.baseURL, { params });
    return response.data;
  }
  
  async getMyEvents(): Promise<PaginatedResponse<CampusEvent>> {
    const response = await axios.get(`${this.baseURL}/my`);
    return response.data;
  }
  
  async getById(id: number): Promise<CampusEvent> {
    const response = await axios.get(`${this.baseURL}/${id}`);
    return response.data;
  }
  
  async create(data: CreateCampusEventDto): Promise<CampusEvent> {
    const response = await axios.post(this.baseURL, data);
    return response.data;
  }
  
  async update(id: number, data: UpdateCampusEventDto): Promise<CampusEvent> {
    const response = await axios.put(`${this.baseURL}/${id}`, data);
    return response.data;
  }
  
  async delete(id: number): Promise<void> {
    await axios.delete(`${this.baseURL}/${id}`);
  }
  
  async register(id: number, notes?: string): Promise<CampusEventRegistration> {
    const response = await axios.post(`${this.baseURL}/${id}/register`, { notes });
    return response.data;
  }
  
  async unregister(id: number): Promise<void> {
    await axios.delete(`${this.baseURL}/${id}/register`);
  }
}

export class ScheduleTemplatesService {
  private baseURL = '/api/schedule-templates';
  
  async list(params: TemplateQueryParams): Promise<PaginatedResponse<ScheduleTemplate>> {
    const response = await axios.get(this.baseURL, { params });
    return response.data;
  }
  
  async getById(id: number): Promise<ScheduleTemplate> {
    const response = await axios.get(`${this.baseURL}/${id}`);
    return response.data;
  }
  
  async create(data: CreateScheduleTemplateDto): Promise<ScheduleTemplate> {
    const response = await axios.post(this.baseURL, data);
    return response.data;
  }
  
  async update(id: number, data: UpdateScheduleTemplateDto): Promise<ScheduleTemplate> {
    const response = await axios.put(`${this.baseURL}/${id}`, data);
    return response.data;
  }
  
  async delete(id: number): Promise<void> {
    await axios.delete(`${this.baseURL}/${id}`);
  }
  
  async applyToSection(data: ApplyTemplateDto): Promise<ApplyTemplateResponse> {
    const response = await axios.post(`${this.baseURL}/apply`, data);
    return response.data;
  }
  
  async bulkApply(data: BulkApplyTemplateDto): Promise<BulkApplyResponse> {
    const response = await axios.post(`${this.baseURL}/apply/bulk`, data);
    return response.data;
  }
}

export class ScheduleService {
  private baseURL = '/api/schedule';
  
  async getDailySchedule(date?: string): Promise<DailySchedule> {
    const response = await axios.get(`${this.baseURL}/my/daily`, {
      params: { date }
    });
    return response.data;
  }
  
  async getWeeklySchedule(startDate?: string): Promise<WeeklySchedule> {
    const response = await axios.get(`${this.baseURL}/my/weekly`, {
      params: { startDate }
    });
    return response.data;
  }
}
```

---

## UI Component Examples

### Campus Events Calendar View

```typescript
import { useState, useEffect } from 'react';
import { CampusEventsService, CampusEvent } from './services';

const CampusEventsCalendar = () => {
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const service = new CampusEventsService();
  
  useEffect(() => {
    loadEvents();
  }, []);
  
  const loadEvents = async () => {
    try {
      const response = await service.list({
        status: 'published',
        fromDate: new Date().toISOString().split('T')[0],
        limit: 50
      });
      setEvents(response.data);
    } catch (error) {
      console.error('Failed to load events', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleRegister = async (eventId: number) => {
    try {
      await service.register(eventId);
      showToast('success', 'Successfully registered!');
      loadEvents(); // Refresh to show registration status
    } catch (error) {
      handleError(error);
    }
  };
  
  return (
    <div className="campus-events">
      <h2>Campus Events</h2>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="events-grid">
          {events.map(event => (
            <div 
              key={event.eventId} 
              className="event-card"
              style={{ borderLeft: `4px solid ${event.color}` }}
            >
              <h3>{event.title}</h3>
              <p>{event.description}</p>
              <div className="event-meta">
                <span>📅 {formatDate(event.startDatetime)}</span>
                <span>📍 {event.location}</span>
                {event.isMandatory && <span className="badge">Mandatory</span>}
              </div>
              
              {event.registrationRequired && (
                <div className="registration">
                  {event.userRegistration ? (
                    <span className="badge success">Registered</span>
                  ) : event.spotsRemaining === 0 ? (
                    <span className="badge danger">Full</span>
                  ) : (
                    <button onClick={() => handleRegister(event.eventId)}>
                      Register ({event.spotsRemaining} spots left)
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

### Unified Schedule View

```typescript
const UnifiedScheduleView = () => {
  const [schedule, setSchedule] = useState<DailySchedule | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const service = new ScheduleService();
  
  useEffect(() => {
    loadSchedule();
  }, [selectedDate]);
  
  const loadSchedule = async () => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    const data = await service.getDailySchedule(dateStr);
    setSchedule(data);
  };
  
  const mergeScheduleItems = (): ScheduleItem[] => {
    if (!schedule) return [];
    
    const items: ScheduleItem[] = [
      ...schedule.schedules.map(s => ({
        type: 'class' as const,
        time: s.startTime,
        title: `${s.section.course.courseCode} - ${s.scheduleType}`,
        location: `${s.building} ${s.room}`,
        color: '#3B82F6',
        data: s
      })),
      ...schedule.exams.map(e => ({
        type: 'exam' as const,
        time: e.startTime,
        title: `${e.examType.toUpperCase()} Exam`,
        location: e.location,
        color: '#EF4444',
        data: e
      })),
      ...schedule.campusEvents.map(e => ({
        type: 'campus_event' as const,
        time: new Date(e.startDatetime).toLocaleTimeString(),
        title: e.title,
        location: e.location,
        color: e.color,
        data: e
      }))
    ];
    
    return items.sort((a, b) => a.time.localeCompare(b.time));
  };
  
  return (
    <div className="schedule-view">
      <div className="date-selector">
        <button onClick={() => setSelectedDate(addDays(selectedDate, -1))}>←</button>
        <h2>{formatDate(selectedDate)} - {schedule?.dayOfWeek}</h2>
        <button onClick={() => setSelectedDate(addDays(selectedDate, 1))}>→</button>
      </div>
      
      <div className="timeline">
        {mergeScheduleItems().map((item, index) => (
          <div 
            key={index}
            className={`schedule-item ${item.type}`}
            style={{ borderLeft: `4px solid ${item.color}` }}
          >
            <div className="time">{item.time}</div>
            <div className="details">
              <h4>{item.title}</h4>
              <p>{item.location}</p>
              {item.type === 'campus_event' && item.data.isMandatory && (
                <span className="badge">Mandatory</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

## Testing

### Test Credentials

```typescript
const TEST_USERS = {
  admin: {
    email: 'omar.tarek@example.com',
    password: 'SecureP@ss123'
  },
  instructor: {
    email: 'ibrahim.tarek@example.com',
    password: 'SecureP@ss123'
  },
  student: {
    email: 'nada.tarek@example.com',
    password: 'SecureP@ss123'
  }
};
```

### Sample API Calls

```bash
# 1. Login
curl -X POST "http://localhost:8081/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "omar.tarek@example.com", "password": "SecureP@ss123"}'

# Response: {"accessToken": "eyJhbGc..."}

# 2. Get My Events
curl -X GET "http://localhost:8081/api/campus-events/my" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 3. Create Campus Event (Admin)
curl -X POST "http://localhost:8081/api/campus-events" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Tech Workshop",
    "eventType": "university_wide",
    "startDatetime": "2026-05-01T14:00:00Z",
    "endDatetime": "2026-05-01T17:00:00Z",
    "status": "published"
  }'

# 4. Register for Event
curl -X POST "http://localhost:8081/api/campus-events/1/register" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"notes": "Looking forward to it!"}'

# 5. Get Daily Schedule
curl -X GET "http://localhost:8081/api/schedule/my/daily?date=2026-04-20" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 6. Create Schedule Template (Admin)
curl -X POST "http://localhost:8081/api/schedule-templates" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "TTh Lab Pattern",
    "scheduleType": "LAB",
    "slots": [
      {
        "dayOfWeek": "TUESDAY",
        "startTime": "14:00:00",
        "endTime": "15:30:00",
        "slotType": "LAB"
      },
      {
        "dayOfWeek": "THURSDAY",
        "startTime": "14:00:00",
        "endTime": "15:30:00",
        "slotType": "LAB"
      }
    ]
  }'

# 7. Apply Template to Section
curl -X POST "http://localhost:8081/api/schedule-templates/apply" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": 1,
    "sectionId": 1,
    "building": "Science Building",
    "room": "Lab 301"
  }'
```

---

## Migration & Database Setup

### Run SQL Migrations

```bash
# 1. Campus Events
mysql -u root -p eduverse_db < DB_CHANGES_CAMPUS_EVENTS.sql

# 2. Schedule Templates
mysql -u root -p eduverse_db < DB_CHANGES_SCHEDULE_TEMPLATES.sql
```

### Verify Tables

```sql
-- Check tables exist
SHOW TABLES LIKE '%campus_event%';
SHOW TABLES LIKE '%schedule_template%';

-- Check sample data
SELECT * FROM campus_events;
SELECT * FROM schedule_templates;
SELECT * FROM schedule_template_slots;
```

---

## Support & Resources

- **API Documentation:** http://localhost:8081/api (Swagger UI)
- **Backend Repository:** [GitHub Link]
- **Postman Collection:** `EduVerse_Postman_Collection.json`

---

## Change Log

### v2.0.0 - 2026-04-07

**Added:**
- Campus Events system (8 new endpoints)
- Schedule Templates system (7 new endpoints)
- Enhanced schedule views with campus events
- Smart office hours suggestions
- Bulk template operations

**Database Changes:**
- Added `campus_events` table
- Added `campus_event_registrations` table
- Added `schedule_templates` table
- Added `schedule_template_slots` table

**Breaking Changes:**
- None - all changes are additive

---

**End of Documentation**

For questions or issues, contact the backend team or create an issue in the repository.
