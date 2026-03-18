# API Contract: Quizzes

**Base URL**: `/api/quizzes`

## Quiz CRUD

### List Quizzes
```http
GET /api/quizzes
```

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `courseId` | string | No | Filter by course |
| `status` | string | No | Filter by status |
| `page` | number | No | Page number (default: 1) |
| `limit` | number | No | Items per page (default: 20) |

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "uuid",
      "courseId": "uuid",
      "title": "string",
      "quizType": "practice | graded",
      "timeLimit": "number | null",
      "maxAttempts": "number",
      "maxScore": "decimal-string",
      "status": "draft | published | closed"
    }
  ],
  "meta": {
    "total": "number",
    "page": "number",
    "limit": "number",
    "totalPages": "number"
  }
}
```

---

### Get Quiz with Questions
```http
GET /api/quizzes/:id
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "title": "string",
  "description": "string | null",
  "quizType": "practice | graded",
  "timeLimit": "number | null",
  "maxAttempts": "number",
  "maxScore": "decimal-string",
  "passingScore": "decimal-string | null",
  "status": "draft | published | closed",
  "showAnswersAfter": "never | submission | grading | due_date",
  "shuffleQuestions": "boolean",
  "questions": [
    {
      "id": "uuid",
      "questionType": "mcq | true_false | short_answer | essay | matching",
      "questionText": "string",
      "points": "decimal-string",
      "order": "number",
      "options": [
        { "id": "uuid", "text": "string", "isCorrect": "boolean" }
      ]
    }
  ]
}
```

---

### Create Quiz (Instructor)
```http
POST /api/quizzes
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "courseId": "uuid",
  "title": "string",
  "description": "string | null",
  "quizType": "practice | graded",
  "timeLimit": "number | null",
  "maxAttempts": "number",
  "maxScore": "decimal-string",
  "passingScore": "decimal-string | null",
  "showAnswersAfter": "never | submission | grading | due_date",
  "shuffleQuestions": "boolean"
}
```

**Response:** `201 Created`

---

### Update Quiz (Instructor)
```http
PUT /api/quizzes/:id
Authorization: Bearer <token>
```

---

### Delete Quiz (Instructor)
```http
DELETE /api/quizzes/:id
Authorization: Bearer <token>
```

**Response:** `204 No Content`

---

## Question Management

### Add Question
```http
POST /api/quizzes/:quizId/questions
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "questionType": "mcq",
  "questionText": "What is 2+2?",
  "points": "5.00",
  "order": 1,
  "options": [
    { "text": "3", "isCorrect": false },
    { "text": "4", "isCorrect": true },
    { "text": "5", "isCorrect": false }
  ],
  "explanation": "Basic arithmetic"
}
```

**Response:** `201 Created`

---

### Update Question
```http
PUT /api/quizzes/:quizId/questions/:questionId
Authorization: Bearer <token>
```

---

### Delete Question
```http
DELETE /api/quizzes/:quizId/questions/:questionId
Authorization: Bearer <token>
```

**Response:** `204 No Content`

---

### Reorder Questions
```http
PATCH /api/quizzes/:quizId/questions/reorder
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "questionIds": ["uuid1", "uuid2", "uuid3"]
}
```

**Response:** `200 OK`

---

## Student Attempts

### Start Attempt
```http
POST /api/quizzes/:quizId/attempts
Authorization: Bearer <token>
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "quizId": "uuid",
  "status": "in_progress",
  "startedAt": "ISO8601",
  "expiresAt": "ISO8601 | null",
  "questions": [
    {
      "id": "uuid",
      "questionType": "mcq",
      "questionText": "string",
      "points": "decimal-string",
      "options": [{ "id": "uuid", "text": "string" }]
    }
  ]
}
```

**Error:** `400 Bad Request` - "No attempts remaining"

---

### Save Progress (Auto-save)
```http
PATCH /api/quizzes/:quizId/attempts/:attemptId/progress
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "answers": [
    { "questionId": "uuid", "answer": "string" },
    { "questionId": "uuid", "selectedOptions": ["optionId1"] }
  ]
}
```

**Response:** `200 OK`

---

### Submit Attempt
```http
POST /api/quizzes/:quizId/attempts/:attemptId/submit
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "answers": [
    { "questionId": "uuid", "answer": "string" },
    { "questionId": "uuid", "selectedOptions": ["optionId1", "optionId2"] }
  ]
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "status": "submitted | graded",
  "submittedAt": "ISO8601",
  "score": "decimal-string | null",
  "autoGradedScore": "decimal-string",
  "results": [
    {
      "questionId": "uuid",
      "isCorrect": "boolean | null",
      "score": "decimal-string | null",
      "correctAnswer": "string (if showAnswersAfter allows)"
    }
  ]
}
```

---

### Get Attempt
```http
GET /api/quizzes/:quizId/attempts/:attemptId
Authorization: Bearer <token>
```

**Response:** `200 OK` (includes saved answers for resume)

---

### Get My Attempts
```http
GET /api/quizzes/:quizId/my-attempts
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "status": "in_progress | submitted | graded",
    "startedAt": "ISO8601",
    "submittedAt": "ISO8601 | null",
    "score": "decimal-string | null"
  }
]
```

---

## Instructor/TA Grading

### Get All Attempts
```http
GET /api/quizzes/:quizId/attempts
Authorization: Bearer <token>
```

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `status` | string | Filter: `submitted`, `graded` |
| `needsGrading` | boolean | Only attempts with ungraded essays |

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "userId": "number",
    "user": { "firstName": "string", "lastName": "string" },
    "status": "submitted | graded",
    "submittedAt": "ISO8601",
    "score": "decimal-string | null",
    "autoGradedScore": "decimal-string",
    "hasUngradedEssays": "boolean"
  }
]
```

---

### Grade Attempt (Manual Questions)
```http
PATCH /api/quizzes/:quizId/attempts/:attemptId/grade
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "grades": [
    {
      "questionId": "uuid",
      "score": "decimal-string",
      "feedback": "string | null"
    }
  ]
}
```

**Response:** `200 OK`

---

## Statistics

### Get Quiz Statistics
```http
GET /api/quizzes/:quizId/statistics
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "totalAttempts": "number",
  "completedAttempts": "number",
  "averageScore": "decimal-string",
  "highestScore": "decimal-string",
  "lowestScore": "decimal-string",
  "passRate": "decimal-string",
  "questionStats": [
    {
      "questionId": "uuid",
      "correctRate": "decimal-string",
      "averageScore": "decimal-string"
    }
  ]
}
```
