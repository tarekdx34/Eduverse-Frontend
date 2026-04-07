# Google Drive & Submissions: Frontend Integration Guide

> This document outlines the API response adjustments and structural changes to the `/submissions`, `/upload` and detail endpoints following the backend drive file linkage fixes. 

---

## 1. Instruction Files on Details Endpoints

The `GET /api/labs/:id` (`findById`) and `GET /api/assignments/:id` (`findOne`) endpoints have been enriched.
Previously, if a lab or assignment had Google Drive instruction files attached, they were disconnected from the main response.

**What Changed:**
The response object will now contain an `instructionFiles` array.

```typescript
// Shape of the response for Lab or Assignment
interface LabOrAssignmentResponse {
  // ... existing fields ...
  instructionFiles: DriveFileLink[];
}

interface DriveFileLink {
  driveId: string;         // The raw Google Drive ID
  fileName: string;        // The uploaded file name
  webViewLink: string;     // Google Drive standard view link
  iframeUrl: string;       // Specialized URL for embedding (ends in /preview)
  downloadUrl: string;     // Specialized URL forcing a file download
}
```

## 2. Reading Submissions (My Submission & All Submissions)

Endpoints:
- `GET /api/labs/:id/submissions`
- `GET /api/labs/:id/submissions/my`
- `GET /api/assignments/:id/submissions`
- `GET /api/assignments/:id/submissions/my`

**What Changed:**
The old `fileId: number | null` property still exists, but the backend now automatically resolves that ID using a SQL join against the Google Drive files table. It attaches a resolved `driveFile` metadata object directly to every submission response!

**Updated Interface:**
```typescript
interface Submission {
  submissionId: number;
  // ... existing fields ...
  fileId: number | null; 
  driveFile: DriveFileLink | null; // <-- NEW: Read constraints from here!
}
```
**Frontend Action:** Instead of making separate network calls to fetch file metadata, the frontend should bind directly to `submission.driveFile.iframeUrl` or `submission.driveFile.webViewLink` when viewing a student's submission.

## 3. Submitting Work (The "UPSERT" Flow)

**The Problem Resolved:**
Previously, calling the `/upload` endpoint created Database Row A. Calling `/submit` immediately after created Database Row B. This caused orphaned empty rows.

**What Changed (UPSERT Logic):**
Both `Assignments` and `Labs` services now use UPSERT resolution. If the student uploads a file first, then submits text right after (or vice versa), the backend updates the *same* submission attempt instead of creating disconnected rows. 

**Frontend Workflow:**
You no longer need to fear hitting the endpoints separately, but you must pass the generated ID to link them efficiently!

```typescript
// Step 1: Upload the file
const uploadRes = await fetch(`/api/labs/${labId}/submissions/upload`, { ... });
const uploadData = await uploadRes.json();
// uploadData returns: { submission: {...}, driveFile: {...}, isLate: false }

// Step 2: Grab the driveFileId from the response!
const assignedDriveFileId = uploadData.driveFile.driveFileId;

// Step 3: Trigger the Submit API (which UPSERTS the text into the same row)
await fetch(`/api/labs/${labId}/submit`, {
  method: 'POST',
  body: JSON.stringify({ 
    submissionText: text,
    fileId: assignedDriveFileId // Pass this back to link them together!
  }),
});
```

## 4. Public File Accessibility

Every file uploaded via the EduVerse backend to Google Drive (Instructions, TA Materials, and Submissions) is now automatically run through Google's `permissions.create` API. 

**Frontend Action:** None required! You will no longer encounter "Request Access" Google Drive walls when rendering the frontend `iframeUrl`. All file accesses are set to `role: 'reader'`, `type: 'anyone'` inherently upon upload.
