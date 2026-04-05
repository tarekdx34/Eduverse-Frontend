# API Contract: Labs

**Base URL**: `/api/labs`

## Lab CRUD

### List Labs

```http
GET /api/labs
```

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `courseId` | string | No | Filter by course |
| `status` | string | No | Filter by status |

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

### Get Lab with Instructions

```http
GET /api/labs/:id
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
  "status": "draft | published | closed",
  "estimatedDuration": "number | null",
  "equipmentRequired": "string | null",
  "safetyNotes": "string | null",
  "instructions": [
    {
      "id": "uuid",
      "order": "number",
      "content": "string",
      "fileId": "number | null"
    }
  ]
}
```

---

### Create Lab (Instructor)

```http
POST /api/labs
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
  "status": "draft | published",
  "estimatedDuration": "number | null",
  "equipmentRequired": "string | null",
  "safetyNotes": "string | null"
}
```

**Response:** `201 Created`

---

### Update Lab (Instructor)

```http
PUT /api/labs/:id
Authorization: Bearer <token>
Content-Type: application/json
```

---

### Delete Lab (Instructor)

```http
DELETE /api/labs/:id
Authorization: Bearer <token>
```

**Response:** `204 No Content`

---

## Instruction Management

### Add Instruction

```http
POST /api/labs/:labId/instructions
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "order": "number",
  "content": "string",
  "fileId": "number | null"
}
```

**Response:** `201 Created`

---

### Update Instruction

```http
PUT /api/labs/:labId/instructions/:instructionId
Authorization: Bearer <token>
Content-Type: application/json
```

---

### Delete Instruction

```http
DELETE /api/labs/:labId/instructions/:instructionId
Authorization: Bearer <token>
```

**Response:** `204 No Content`

---

### Reorder Instructions

```http
PATCH /api/labs/:labId/instructions/reorder
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "instructionIds": ["uuid1", "uuid2", "uuid3"]
}
```

**Response:** `200 OK`

---

## Student Submissions

### Get My Submission

```http
GET /api/labs/:labId/my-submission
Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
{
  "id": "uuid",
  "labId": "uuid",
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

### Submit Lab

```http
POST /api/labs/:labId/submit
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `submissionText` | string | No | Lab report text |
| `file` | File | No | Upload file (max 10MB) |

_At least one of `submissionText` or `file` required_

**Response:** `201 Created`

---

## Instructor/TA Operations

### Get All Submissions

```http
GET /api/labs/:labId/submissions
Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
[
  {
    "id": "uuid",
    "userId": "number",
    "user": {
      "firstName": "string",
      "lastName": "string",
      "email": "string"
    },
    "submissionStatus": "pending | submitted | graded",
    "submittedAt": "ISO8601",
    "score": "decimal-string | null"
  }
]
```

---

### Grade Submission

```http
PATCH /api/labs/:labId/submissions/:submissionId/grade
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

### Update Submission Status

```http
PATCH /api/labs/:labId/submissions/:submissionId/status
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "status": "graded | returned | resubmit"
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
