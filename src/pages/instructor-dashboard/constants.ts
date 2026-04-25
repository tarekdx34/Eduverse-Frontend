export const INSTRUCTOR_INFO = {
  name: 'Instructor Name',
  email: 'instructor@eduverse.edu',
  department: 'Department',
};

export const SECTIONS: any[] = [
  {
    sectionId: 101,
    courseId: 101,
    courseCode: 'CS301',
    courseName: 'Software Engineering',
    sectionLabel: 'Sec 1',
    schedule: 'Sun/Tue 10:00-11:30',
    capacity: 60,
    enrolled: 42,
  },
  {
    sectionId: 102,
    courseId: 102,
    courseCode: 'CS341',
    courseName: 'Database Systems',
    sectionLabel: 'Sec 1',
    schedule: 'Mon/Wed 12:00-13:30',
    capacity: 50,
    enrolled: 36,
  },
  {
    sectionId: 103,
    courseId: 103,
    courseCode: 'CS355',
    courseName: 'Computer Networks',
    sectionLabel: 'Sec 1',
    schedule: 'Thu 09:00-12:00',
    capacity: 45,
    enrolled: 29,
  },
];
export const ROSTERS: Record<string, any[]> = {
  '101': Array.from({ length: 12 }, (_, i) => ({
    id: 1000 + i + 1,
    name: `Student ${i + 1}`,
    email: `student${i + 1}@eduverse.local`,
    status: 'Enrolled',
    grade: ['A', 'B+', 'B', 'A-', 'B'][i % 5],
  })),
  '102': Array.from({ length: 10 }, (_, i) => ({
    id: 2000 + i + 1,
    name: `DB Student ${i + 1}`,
    email: `db.student${i + 1}@eduverse.local`,
    status: 'Enrolled',
    grade: ['A', 'A-', 'B+', 'B'][i % 4],
  })),
  '103': Array.from({ length: 8 }, (_, i) => ({
    id: 3000 + i + 1,
    name: `Net Student ${i + 1}`,
    email: `net.student${i + 1}@eduverse.local`,
    status: 'Enrolled',
    grade: ['A', 'B+', 'B'][i % 3],
  })),
};
export const WAITLISTS: Record<string, any[]> = {};
export const DASHBOARD_STATS: any[] = [];
export const ASSIGNMENTS: Record<string, any[]> = {};
export const GRADES: Record<string, any[]> = {};
export const ATTENDANCE: Record<string, any[]> = {
  '101': [
    { id: 1, date: '2026-04-07', present: 38, absent: 4, type: 'lecture', status: 'closed' },
    { id: 2, date: '2026-04-14', present: 36, absent: 6, type: 'lecture', status: 'closed' },
  ],
  '102': [
    { id: 3, date: '2026-04-08', present: 31, absent: 5, type: 'lecture', status: 'closed' },
    { id: 4, date: '2026-04-15', present: 33, absent: 3, type: 'lab', status: 'closed' },
  ],
  '103': [
    { id: 5, date: '2026-04-10', present: 25, absent: 4, type: 'lecture', status: 'closed' },
  ],
};
export const MESSAGES: any[] = [];
export const ANALYTICS = {
  gradeDistribution: {},
  enrollmentTrend: [],
};
export const INSTRUCTOR_PROFILE = {
  name: 'Instructor Name',
  email: 'instructor@eduverse.edu',
  phone: '',
  department: 'Department',
  office: '',
  officeHours: '',
  bio: '',
  specialization: [],
  education: [],
  joinDate: '',
};
export const UPCOMING_CLASSES: any[] = [];
export const PENDING_TASKS: any[] = [];
export const RECENT_ACTIVITY: any[] = [];
export const COURSES: any[] = [
  {
    id: 101,
    courseId: 101,
    courseCode: 'CS301',
    courseName: 'Software Engineering',
    semester: 'Spring 2026',
    credits: 3,
    prerequisites: ['CS201'],
    description: 'Core software engineering concepts, patterns, and team workflows.',
    enrolled: 42,
    capacity: 60,
    schedule: 'Sun/Tue 10:00-11:30',
    room: 'B-204',
    status: 'active',
    averageGrade: 84,
    attendanceRate: 91,
  },
  {
    id: 102,
    courseId: 102,
    courseCode: 'CS341',
    courseName: 'Database Systems',
    semester: 'Spring 2026',
    credits: 3,
    prerequisites: ['CS240'],
    description: 'Relational modeling, SQL optimization, indexing, and transaction design.',
    enrolled: 36,
    capacity: 50,
    schedule: 'Mon/Wed 12:00-13:30',
    room: 'A-112',
    status: 'active',
    averageGrade: 79,
    attendanceRate: 88,
  },
  {
    id: 103,
    courseId: 103,
    courseCode: 'CS355',
    courseName: 'Computer Networks',
    semester: 'Spring 2026',
    credits: 3,
    prerequisites: ['CS250'],
    description: 'Network layers, routing, transport protocols, and practical diagnostics.',
    enrolled: 29,
    capacity: 45,
    schedule: 'Thu 09:00-12:00',
    room: 'Lab-3',
    status: 'active',
    averageGrade: 82,
    attendanceRate: 90,
  },
];

// AI FEATURES MOCK DATA
export const AI_ATTENDANCE_SESSIONS: any[] = [];
export const MOCK_GENERATED_QUIZ = null;
export const MOCK_GRADING_SUGGESTIONS: any[] = [];
export const FEEDBACK_TEMPLATES: any[] = [];
