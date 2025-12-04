# ClassTab Component Documentation

## Overview
The `ClassTab` component displays enrolled courses for a student, showing course details, instructor information, schedule, and progress tracking. It's designed to match the Figma design specification for the Student Dashboard "My Class" tab.

## Features
- 📊 Course statistics (Total, Completed, In Progress, Credits)
- 🎓 Course cards with progress tracking
- 👨‍🏫 Instructor information with profile images
- 📅 Schedule and next class information
- 👥 Student count and course credits
- 🎯 Progress bars with color coding
- 📱 Responsive grid layout (1 col mobile, 2 col tablet, 3 col desktop)

## Props

### `ClassTabProps`

```typescript
interface ClassTabProps {
  courses?: Course[];
  stats?: {
    totalCourses: number;
    completed: number;
    inProgress: number;
    totalCredits: number;
  };
}
```

### Course Structure

```typescript
interface Course {
  id: string;
  title: string;                 // Course name
  courseCode: string;            // e.g., "CS101"
  instructor: string;            // Instructor name
  instructorImage: string;       // URL to instructor profile image
  schedule: string;              // e.g., "Mon, Wed, Fri - 08:30 AM"
  nextClass: string;             // e.g., "Next: Monday, 08:30 AM"
  room: string;                  // Classroom location
  students: number;              // Total enrolled students
  credits: number;               // Course credits
  progress: number;              // Progress percentage (0-100)
  color: string;                 // Background color (hex)
  progressColor: string;         // Progress bar color (hex)
}
```

## Usage

### Basic Usage (Default Data)
```tsx
import { ClassTab } from '@/pages/dashboard/components';

export function MyDashboard() {
  return <ClassTab />;
}
```

### With Custom Courses
```tsx
<ClassTab
  courses={[
    {
      id: '1',
      title: 'Introduction to Computer Science',
      courseCode: 'CS101',
      instructor: 'Dr. Sarah Johnson',
      instructorImage: 'https://example.com/avatar.jpg',
      schedule: 'Mon, Wed, Fri - 08:30 AM',
      nextClass: 'Next: Monday, 08:30 AM',
      room: 'Room 301',
      students: 45,
      credits: 3,
      progress: 75,
      color: '#e0e7ff',
      progressColor: '#2b7fff',
    },
  ]}
  stats={{
    totalCourses: 6,
    completed: 1,
    inProgress: 5,
    totalCredits: 20,
  }}
/>
```

## Integration with Dashboard

### Option 1: Tab-based Navigation
```tsx
import { useState } from 'react';
import { ClassTab, DailySchedule, GpaChart } from './components';

export function StudentDashboard() {
  const [activeTab, setActiveTab] = useState('classes');

  return (
    <div>
      {/* Tab buttons */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('classes')}
          className={`px-4 py-2 rounded ${
            activeTab === 'classes' ? 'bg-purple-600 text-white' : 'bg-gray-200'
          }`}
        >
          My Class
        </button>
        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-4 py-2 rounded ${
            activeTab === 'schedule' ? 'bg-purple-600 text-white' : 'bg-gray-200'
          }`}
        >
          Schedule
        </button>
      </div>

      {/* Tab content */}
      {activeTab === 'classes' && <ClassTab />}
      {activeTab === 'schedule' && <DailySchedule schedules={scheduleData} />}
    </div>
  );
}
```

### Option 2: Standalone Page
```tsx
import { ClassTab } from '@/pages/dashboard/components';

export function MyClassPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">My Classes</h1>
      <ClassTab />
    </div>
  );
}
```

## Styling

The component uses Tailwind CSS classes and is responsive:
- **Mobile**: Single column grid
- **Tablet (md)**: 2 column grid
- **Desktop (lg)**: 3 column grid

## Course Card Features

1. **Color Bar**: Top color bar matches progress bar color
2. **Header**: Course title, code, and menu button
3. **Instructor Info**: Profile image, name, and title
4. **Schedule Details**: Meeting times and next class info
5. **Stats**: Student count and credit hours
6. **Progress Bar**: Visual progress tracking
7. **Action Buttons**: "View Course" and "Materials"

## Default Data

The component includes comprehensive default data with 6 sample courses:
1. Introduction to Computer Science (CS101)
2. Data Structures & Algorithms (CS201)
3. Web Development Fundamentals (CS150)
4. Database Management Systems (CS220)
5. Software Engineering Principles (CS305)
6. Mobile Application Development (CS350)

## Customization

### Change Progress Colors
```tsx
const courses = [
  {
    ...defaultCourse,
    progressColor: '#ff0000', // Custom red color
  },
];
```

### Update Statistics
```tsx
const stats = {
  totalCourses: 8,
  completed: 3,
  inProgress: 5,
  totalCredits: 25,
};
```

### Modify Responsive Grid
Edit the grid classes in the component:
```tsx
// Current: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
// Change to show 2 courses on desktop:
// grid-cols-1 md:grid-cols-2 lg:grid-cols-2
```

## Accessibility Features

- Semantic HTML structure
- Descriptive alt text for images
- Clear visual hierarchy
- Sufficient color contrast
- Keyboard navigable buttons
- ARIA-friendly component structure

## Error Handling

- Instructor images have fallback for broken URLs
- Graceful handling of missing data
- Default values for all props

## Performance

- Efficient rendering with React
- Optimized CSS classes
- Lazy-loaded component
- No unnecessary re-renders

## API Integration Example

```tsx
import { useEffect, useState } from 'react';
import { ClassTab } from '@/pages/dashboard/components';

export function ClassTabWithAPI() {
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/student/courses')
      .then(res => res.json())
      .then(data => {
        setCourses(data.courses);
        setStats(data.stats);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return <ClassTab courses={courses} stats={stats} />;
}
```

## File Location
`src/pages/dashboard/components/ClassTab.tsx`

## Component Dependencies
- React (for hooks and JSX)
- Tailwind CSS (for styling)
- lucide-react (for icons: Clock, Users, BookOpen, MoreVertical)
