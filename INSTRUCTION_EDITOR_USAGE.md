# InstructionEditor Component Usage Guide

## Overview
The `InstructionEditor` component is a modal dialog for managing lab instructions. It provides functionality to view, add, edit, and delete step-by-step instructions for lab assignments.

**Location**: `src/pages/instructor-dashboard/components/labs/InstructionEditor.tsx`

## Features
- ✅ Modal dialog showing all instructions for a lab
- ✅ List of InstructionCard components with visual order indicators
- ✅ Add new instruction form with:
  - Textarea for instruction text
  - Optional file upload
  - Auto-calculated order index (last position + 1)
- ✅ Delete instructions with confirmation dialog
- ✅ Edit existing instructions inline
- ✅ Loading states for API calls
- ✅ Empty state when no instructions exist
- ✅ Dark/light mode support
- ✅ Internationalization (i18n) support via useLanguage hook
- ✅ Toast notifications for user feedback

## Component Props

```typescript
interface InstructionEditorProps {
  isOpen: boolean;                    // Controls modal visibility
  lab: Lab;                           // Lab object with id and title
  onClose: () => void;                // Callback when modal closes
  onInstructionsUpdated: () => void;  // Callback after any instruction change
}
```

## Basic Usage

### 1. Import the component
```tsx
import { InstructionEditor } from './components/labs/InstructionEditor';
import { useState } from 'react';

function MyComponent() {
  const [showInstructionEditor, setShowInstructionEditor] = useState(false);
  const [selectedLab, setSelectedLab] = useState<Lab | null>(null);

  const handleManageInstructions = (lab: Lab) => {
    setSelectedLab(lab);
    setShowInstructionEditor(true);
  };

  return (
    <>
      <InstructionEditor
        isOpen={showInstructionEditor}
        lab={selectedLab!}
        onClose={() => setShowInstructionEditor(false)}
        onInstructionsUpdated={() => {
          // Refresh lab data or UI after instructions are updated
          refreshLabData();
        }}
      />
    </>
  );
}
```

### 2. Integration with LabDetail component
The LabDetail component already has an `onManageInstructions` callback. Connect it like this:

```tsx
function LabsDashboard() {
  const [showInstructionEditor, setShowInstructionEditor] = useState(false);
  const [selectedLabForInstructions, setSelectedLabForInstructions] = useState<Lab | null>(null);

  return (
    <>
      <LabDetail
        isOpen={isDetailOpen}
        lab={selectedLab}
        onClose={handleCloseDetail}
        onEditClick={handleEdit}
        onViewSubmissions={handleViewSubmissions}
        onManageInstructions={() => {
          setSelectedLabForInstructions(selectedLab);
          setShowInstructionEditor(true);
        }}
        onUploadTaMaterials={handleUploadTA}
        onViewAttendance={handleViewAttendance}
      />

      <InstructionEditor
        isOpen={showInstructionEditor}
        lab={selectedLabForInstructions!}
        onClose={() => setShowInstructionEditor(false)}
        onInstructionsUpdated={() => {
          refresh(); // Refresh labs list
        }}
      />
    </>
  );
}
```

## API Calls Used

The component uses the following LabService methods:

### Get Instructions
```typescript
LabService.getInstructions(labId: string): Promise<LabInstruction[]>
```
Fetches all instructions for a lab, sorted by orderIndex.

### Add Instruction
```typescript
LabService.addInstruction(
  labId: string,
  data: { instructionText: string; orderIndex: number; fileId?: number }
): Promise<LabInstruction>
```
Adds a new instruction with optional file attachment.

### Upload Instruction File
```typescript
LabService.uploadInstructionFile(labId: string, file: File): Promise<LabInstruction>
```
Uploads a file and creates an instruction. Use FormData with multipart/form-data.

### Update Instruction
```typescript
LabService.updateInstruction(
  labId: string,
  instructionId: string,
  data: { instructionText?: string; orderIndex?: number }
): Promise<LabInstruction>
```
Updates instruction text or order index.

### Delete Instruction
```typescript
LabService.deleteInstruction(labId: string, instructionId: string): Promise<void>
```
Deletes an instruction (requires confirmation).

## Component Behavior

### Loading State
- Shows a loading spinner while fetching instructions
- Disables buttons while operations are in progress

### Empty State
- Displays a helpful message when no instructions exist
- Allows users to add their first instruction

### Add New Instruction
1. User enters instruction text in textarea
2. User optionally selects a file to upload
3. Order index is automatically calculated as `instructions.length`
4. Form validates that either text or file is provided
5. On success:
   - New instruction is added to the list
   - Form is reset
   - Success toast is shown
   - `onInstructionsUpdated` callback is triggered

### Edit Instruction
1. User clicks edit button on an instruction card
2. Instruction text becomes editable inline
3. User updates the text and clicks save
4. On success:
   - Instruction is updated locally and on server
   - Success toast is shown
   - Edit mode is exited
   - `onInstructionsUpdated` callback is triggered

### Delete Instruction
1. User clicks delete button
2. Confirmation dialog appears
3. On confirmation:
   - Instruction is deleted from server
   - Instruction is removed from local list
   - Success toast is shown
   - `onInstructionsUpdated` callback is triggered

## Styling

The component supports dark/light mode through the `useTheme()` hook:
- Dark mode: slate colors with high contrast
- Light mode: white/gray colors for readability

All colors use dynamic primary color from theme (default: blue #3b82f6).

## Internationalization

The component uses `useLanguage()` hook for i18n. Required translation keys:
- `manageInstructions` - Modal title
- `currentInstructions` - Instructions list heading
- `addNewInstruction` - Add form heading
- `noInstructions` - Empty state message
- `instructionText` - Label for instruction text field
- `attachFile` - Label for file upload
- `orderPosition` - Order index display
- `addInstruction` - Submit button label
- `save` - Save button label
- `cancel` - Cancel button label
- `close` - Close button label
- `edit` - Edit button label
- `delete` - Delete button label
- `errorLoadingInstructions` - Error toast message
- `errorAddingInstruction` - Error toast message
- `errorUpdatingInstruction` - Error toast message
- `errorDeletingInstruction` - Error toast message
- `errorUploadingFile` - Error toast message
- `instructionTextRequired` - Validation error
- `instructionTextOrFileRequired` - Validation error
- `instructionAdded` - Success toast
- `instructionUpdated` - Success toast
- `instructionDeleted` - Success toast
- `confirmDelete` - Delete confirmation dialog

## Error Handling

The component handles errors gracefully:
- Network errors are caught and displayed as toasts
- File upload failures are caught separately
- Validation errors prevent submission
- All errors are logged to console for debugging

## Type Definitions

### Lab
```typescript
interface Lab {
  id: string;
  labId?: number;
  courseId: string;
  title: string;
  description: string | null;
  labNumber: number | null;
  dueDate: string | null;
  availableFrom: string | null;
  maxScore: string;
  weight: string;
  status: LabStatus;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
  course?: { id: string; name: string; code: string };
  instructions?: LabInstruction[];
}
```

### LabInstruction
```typescript
interface LabInstruction {
  id: string;
  instructionId?: number;
  labId: string;
  instructionText: string | null;
  fileId: number | null;
  file?: DriveFile;
  orderIndex: number;
  createdAt: string;
}
```

### DriveFile
```typescript
interface DriveFile {
  fileId: number;
  fileName: string;
  mimeType: string;
  webViewLink?: string;
  webContentLink?: string;
}
```

## Related Components

- **InstructionCard** (`./shared/InstructionCard.tsx`)
  - Displays individual instruction with order badge
  - Shows file attachments with links
  - Provides edit/delete buttons when showActions is true

- **LabDetail** (parent component)
  - Contains the `onManageInstructions` callback
  - Displays preview of first 3 instructions

## File Structure

```
src/pages/instructor-dashboard/components/labs/
├── InstructionEditor.tsx          ← Main modal component
├── shared/
│   └── InstructionCard.tsx        ← Instruction display card
├── types.ts                        ← Type definitions
├── LabDetail.tsx                   ← Parent component
├── LabsDashboard.tsx              ← Root dashboard
└── hooks/
    └── useLabs.ts                  ← Data hooks
```

## Notes

- Instructions are always sorted by `orderIndex` for correct display
- File upload uses FormData with multipart/form-data headers
- The component is modal-based for focused editing experience
- Deletes require confirmation to prevent accidents
- Order indices are assigned sequentially as instructions are added
- Edit mode is inline without a separate modal for better UX
