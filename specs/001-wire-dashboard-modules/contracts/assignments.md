# API Contract: Assignments

**Base URL**: `/api/assignments`

## Endpoints

### List Assignments

```http
GET /api/assignments
```

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `courseId` | string | No | Filter by course |
| `status` | string | No | Filter by status: `draft`, `published`, `closed` |

**Response:** `200 OK`

```json
[
  {
    "id": "uuid",
    "courseId": "uuid",
    "title": "string",
    "description": "string | null",
    "dueDate": "ISO8601 | null",
    "maxScore": "decimal-string",
    "weight": "decimal-string",
    "status": "draft | published | closed",
    "course": {
      "id": "uuid",
      "name": "string",
      "code": "string"
    }
  }
]
```

---

### Get Assignment

```http
GET /api/assignments/:id
```

**Response:** `200 OK`

```json
{
  "id": "uuid",
  "courseId": "uuid",
  "title": "string",
  "description": "string | null",
  "dueDate": "ISO8601 | null",
  "maxScore": "decimal-string",
  "weight": "decimal-string",
  "status": "draft | published | closed",
  "submissionType": "text | file | link | any",
  "latePenalty": "number | null",
  "course": { ... }
}
```

---

### Create Assignment (Instructor)

```http
POST /api/assignments
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "courseId": "uuid",
  "title": "string",
  "description": "string | null",
  "dueDate": "ISO8601 | null",
  "maxScore": "decimal-string",
  "weight": "decimal-string",
  "status": "draft | published",
  "submissionType": "text | file | link | any",
  "latePenalty": "number | null"
}
```

**Response:** `201 Created`

```json
{ "id": "uuid", ... }
```

---

### Update Assignment (Instructor)

```http
PUT /api/assignments/:id
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:** Same as Create (partial allowed)

**Response:** `200 OK`

---

### Delete Assignment (Instructor)

```http
DELETE /api/assignments/:id
Authorization: Bearer <token>
```

**Response:** `204 No Content`

---

### Get My Submission (Student)

```http
GET /api/assignments/:assignmentId/my-submission
Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
{
  "id": "uuid",
  "assignmentId": "uuid",
  "userId": "number",
  "submissionText": "string | null",
  "fileId": "number | null",
  "submissionStatus": "pending | submitted | graded",
  "submittedAt": "ISO8601",
  "score": "decimal-string | null",
  "feedback": "string | null"
}
```

**Response:** `404 Not Found` (no submission yet)

---

### Submit Text (Student)

```http
POST /api/assignments/:assignmentId/submit
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "submissionText": "string"
}
```

**Response:** `201 Created`

---

### Submit File (Student)

```http
POST /api/assignments/:assignmentId/submit
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
| Field | Type | Description |
|-------|------|-------------|
| `file` | File | Upload file (max 10MB) |

**Response:** `201 Created`

---

### Get All Submissions (Instructor/TA)

```http
GET /api/assignments/:assignmentId/submissions
Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
[
  {
    "id": "uuid",
    "userId": "number",
    "user": { "firstName": "string", "lastName": "string", "email": "string" },
    "submissionStatus": "pending | submitted | graded",
    "submittedAt": "ISO8601",
    "score": "decimal-string | null"
  }
]
```

---

### Grade Submission (Instructor/TA)

```http
PATCH /api/assignments/:assignmentId/submissions/:submissionId/grade
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "score": "decimal-string",
  "feedback": "string | null"
}
```

**Response:** `200 OK`

---

## Error Responses

| Status | Meaning                            |
| ------ | ---------------------------------- |
| `400`  | Invalid request body               |
| `401`  | Not authenticated                  |
| `403`  | Not authorized (wrong role)        |
| `404`  | Resource not found                 |
| `409`  | Conflict (e.g., already submitted) |
| `413`  | File too large                     |
| `422`  | Validation error                   |
