# Backend Updates Guide

This guide details the backend changes made and how frontend developers can interact with the newly added features and structure.

## 1. Notifications: Clear Read

You can now delete only the notifications that have been marked as read, instead of clearing the entire notification box.

- **Endpoint:** `DELETE /api/notifications/clear-read`
- **Method:** `DELETE`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Response:**
  ```json
  {
    "affected": 4
  }
  ```
  *(Returns the number of read notifications that were deleted).*

## 2. Profiles: Academic Interests and Skills

Students and users can now maintain their Academic Interests and Skills on their profile. Additionally, when an enrollment status is marked as `COMPLETED` and the student receives a passing grade, the skills defined dynamically in the `Course` are automatically merged into the student's personal `skills` array.

- **Endpoint (Update Profile):** `PUT /api/users/profile`
- **Method:** `PUT`
- **Payload (`UpdateProfileDto` updates):**
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "academicInterests": ["Artificial Intelligence", "Machine Learning"],
    "skills": ["Python", "Data Analysis"]
  }
  ```

- **Endpoint (Get Profile):** `GET /api/users/profile`
- **Response Body Updates:**
  The `academicInterests` and `skills` arrays have been added to the response payload.
  ```json
  {
    "userId": 1,
    "email": "johndoe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "academicInterests": ["Artificial Intelligence", "Machine Learning"],
    "skills": ["Python", "Data Analysis", "React", "Node.js"],
    "profileCompleteness": 100
  }
  ```

## 3. Courses: Defining Skills

Administrators can configure the skills that a course offers when creating or updating it. These skills will automatically be transferred to students passing the course.

- **Endpoints:** `POST /api/courses`, `PUT /api/courses/:id`
- **Payload Addition:** Add a `skills` array in the request body.
  ```json
  {
    "name": "Introduction to AI",
    "code": "AI101",
    "departmentId": 1,
    "credits": 3,
    "level": "beginner",
    "skills": ["Neural Networks", "Data Modeling"]
  }
  ```

## 4. Instructors: Student Roster Fixes

The Student Roster response has been enhanced to return detailed user information alongside the final scores and grades properly nested. 

- **Endpoint:** `GET /api/enrollments/section/:sectionId/students`
- **Response Structure Modification:**
  A populated `user` object has been embedded within the enrollment payload, eliminating missing user details on the frontend.
  ```json
  [
    {
      "id": 100,
      "userId": 5,
      "user": {
        "userId": 5,
        "firstName": "Jane",
        "lastName": "Smith",
        "fullName": "Jane Smith",
        "email": "jane@example.com",
        "profilePictureUrl": "..."
      },
      "sectionId": 12,
      "status": "enrolled",
      "grade": "A-",
      "finalScore": 92.5,
      "enrollmentDate": "2024-09-01T10:00:00Z"
    }
  ]
  ```

## 5. Enrollment: Status Updates

The stub for manually updating an enrollment status has been fully implemented.

- **Endpoint:** `POST /api/enrollments/:id/status`
- **Method:** `POST`
- **Payload:**
  ```json
  {
    "status": "completed"
  }
  ```
  *(Note: Switching a status to `"completed"` triggers the automatic skill absorption process mentioned in point 2 if the user's grade is passing).*
