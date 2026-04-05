export const TA_INFO = {
  name: 'Ahmed Hassan',
  email: 'ahmed.hassan@eduverse.edu',
  department: 'Computer Science',
};

// Mock courses assigned to TA
export const ASSIGNED_COURSES = [
  {
    id: 'cs101',
    name: 'Introduction to Programming',
    code: 'CS101',
    instructor: {
      id: 'inst1',
      name: 'Dr. Jane Smith',
      email: 'jane.smith@eduverse.edu',
    },
    semester: 'Fall 2025',
    labCount: 8,
    studentCount: 45,
    pendingSubmissions: 12,
    averageGrade: 85.5,
    attendanceRate: 92.3,
  },
  {
    id: 'cs202',
    name: 'Data Structures',
    code: 'CS202',
    instructor: {
      id: 'inst2',
      name: 'Dr. Michael Brown',
      email: 'michael.brown@eduverse.edu',
    },
    semester: 'Fall 2025',
    labCount: 10,
    studentCount: 38,
    pendingSubmissions: 8,
    averageGrade: 82.1,
    attendanceRate: 88.7,
  },
  {
    id: 'cs303',
    name: 'Advanced Algorithms',
    code: 'CS303',
    instructor: {
      id: 'inst3',
      name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@eduverse.edu',
    },
    semester: 'Fall 2025',
    labCount: 6,
    studentCount: 32,
    pendingSubmissions: 5,
    averageGrade: 79.8,
    attendanceRate: 85.2,
  },
];

// Mock labs
export const LABS = [
  {
    id: 'lab1',
    courseId: 'cs101',
    courseName: 'Introduction to Programming',
    labNumber: 1,
    title: 'Lab 1: Basic Syntax and Variables',
    date: '2025-02-15',
    time: '10:00 AM - 12:00 PM',
    location: 'Lab A-101',
    status: 'completed' as const,
    instructions: 'Complete exercises 1-5 from the lab manual. Submit your code files.',
    materials: [
      { id: '1', name: 'Lab1_Manual.pdf', type: 'pdf', url: '#' },
      { id: '2', name: 'Lab1_Example.mp4', type: 'video', url: '#' },
    ],
    submissionCount: 42,
    gradedCount: 40,
    attendanceCount: 43,
  },
  {
    id: 'lab2',
    courseId: 'cs101',
    courseName: 'Introduction to Programming',
    labNumber: 2,
    title: 'Lab 2: Control Structures',
    date: '2025-02-22',
    time: '10:00 AM - 12:00 PM',
    location: 'Lab A-101',
    status: 'active' as const,
    instructions: 'Implement if-else statements and loops. Complete all exercises.',
    materials: [{ id: '3', name: 'Lab2_Manual.pdf', type: 'pdf', url: '#' }],
    submissionCount: 38,
    gradedCount: 30,
    attendanceCount: 41,
  },
  {
    id: 'lab3',
    courseId: 'cs202',
    courseName: 'Data Structures',
    labNumber: 1,
    title: 'Lab 1: Arrays and Linked Lists',
    date: '2025-02-20',
    time: '2:00 PM - 4:00 PM',
    location: 'Lab B-205',
    status: 'active' as const,
    instructions: 'Implement array operations and basic linked list operations.',
    materials: [
      { id: '4', name: 'Lab1_DS_Manual.pdf', type: 'pdf', url: '#' },
      { id: '5', name: 'LinkedList_Demo.mp4', type: 'video', url: '#' },
    ],
    submissionCount: 35,
    gradedCount: 28,
    attendanceCount: 36,
  },
  {
    id: 'lab4',
    courseId: 'cs303',
    courseName: 'Advanced Algorithms',
    labNumber: 1,
    title: 'Lab 1: Sorting Algorithms',
    date: '2025-02-25',
    time: '9:00 AM - 11:00 AM',
    location: 'Lab C-301',
    status: 'upcoming' as const,
    instructions: 'Implement bubble sort, merge sort, and quick sort algorithms.',
    materials: [],
    submissionCount: 0,
    gradedCount: 0,
    attendanceCount: 0,
  },
];

// Mock submissions
export const SUBMISSIONS: Record<string, any[]> = {
  lab1: [
    {
      id: 'sub1',
      labId: 'lab1',
      studentId: 'stu1',
      studentName: 'Mohamed Ali',
      submittedAt: '2025-02-14T14:30:00',
      files: [
        { id: 'f1', name: 'exercise1.py', size: '2.3 KB' },
        { id: 'f2', name: 'exercise2.py', size: '3.1 KB' },
      ],
      status: 'graded',
      grade: 95,
      feedback: 'Excellent work! Code is well-structured and follows best practices.',
    },
    {
      id: 'sub2',
      labId: 'lab1',
      studentId: 'stu2',
      studentName: 'Fatima Ahmed',
      submittedAt: '2025-02-14T15:45:00',
      files: [{ id: 'f3', name: 'lab1_solution.py', size: '5.2 KB' }],
      status: 'graded',
      grade: 88,
      feedback: 'Good implementation. Consider adding more comments.',
    },
    {
      id: 'sub3',
      labId: 'lab1',
      studentId: 'stu3',
      studentName: 'Omar Hassan',
      submittedAt: '2025-02-15T09:20:00',
      files: [{ id: 'f4', name: 'exercises.zip', size: '12.5 KB' }],
      status: 'graded',
      grade: 92,
      feedback: 'Well done!',
    },
  ],
  lab2: [
    {
      id: 'sub4',
      labId: 'lab2',
      studentId: 'stu1',
      studentName: 'Mohamed Ali',
      submittedAt: '2025-02-21T13:15:00',
      files: [{ id: 'f5', name: 'control_structures.py', size: '4.8 KB' }],
      status: 'submitted',
      grade: null,
      feedback: null,
    },
    {
      id: 'sub5',
      labId: 'lab2',
      studentId: 'stu4',
      studentName: 'Layla Mohamed',
      submittedAt: '2025-02-22T11:30:00',
      files: [{ id: 'f6', name: 'lab2_solution.py', size: '6.1 KB' }],
      status: 'submitted',
      grade: null,
      feedback: null,
    },
  ],
};

// Dashboard statistics
export const DASHBOARD_STATS = {
  totalCourses: ASSIGNED_COURSES.length,
  activeLabs: LABS.filter((l) => l.status === 'active').length,
  pendingSubmissions: LABS.reduce((sum, lab) => sum + (lab.submissionCount - lab.gradedCount), 0),
  averagePerformance: 82.5,
  unreadMessages: 5,
  upcomingLabs: LABS.filter((l) => l.status === 'upcoming').length,
};

// Recent activity
export const RECENT_ACTIVITY = [
  {
    id: 'act1',
    type: 'submission',
    message: 'Mohamed Ali submitted Lab 2',
    timestamp: '2025-02-21T13:15:00',
    course: 'CS101',
  },
  {
    id: 'act2',
    type: 'question',
    message: 'New question from Fatima Ahmed about Lab 1',
    timestamp: '2025-02-20T10:30:00',
    course: 'CS101',
  },
  {
    id: 'act3',
    type: 'grade',
    message: 'Graded 5 submissions for Lab 1',
    timestamp: '2025-02-19T16:45:00',
    course: 'CS101',
  },
  {
    id: 'act4',
    type: 'attendance',
    message: 'Marked attendance for Lab 1',
    timestamp: '2025-02-18T12:00:00',
    course: 'CS101',
  },
];

// Upcoming labs
export const UPCOMING_LABS = LABS.filter((l) => l.status === 'upcoming')
  .slice(0, 5)
  .map((lab) => ({
    id: lab.id,
    title: lab.title,
    course: lab.courseName,
    date: lab.date,
    time: lab.time,
    location: lab.location,
  }));

// Student performance data
export const STUDENT_PERFORMANCE = [
  {
    studentId: 'stu1',
    studentName: 'Mohamed Ali',
    courses: [
      {
        courseId: 'cs101',
        courseName: 'Introduction to Programming',
        averageGrade: 93.5,
        attendanceRate: 100,
        submissionCount: 2,
        lateSubmissions: 0,
      },
    ],
    overallAverage: 93.5,
    overallAttendance: 100,
  },
  {
    studentId: 'stu2',
    studentName: 'Fatima Ahmed',
    courses: [
      {
        courseId: 'cs101',
        courseName: 'Introduction to Programming',
        averageGrade: 88.0,
        attendanceRate: 95,
        submissionCount: 1,
        lateSubmissions: 0,
      },
    ],
    overallAverage: 88.0,
    overallAttendance: 95,
  },
];
