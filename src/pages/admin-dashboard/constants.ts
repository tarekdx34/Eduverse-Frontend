// Admin Dashboard Constants and Mock Data

export const ADMIN_INFO = {
  name: 'System Administrator',
  email: 'admin@eduverse.edu',
  role: 'Super Admin',
};

// Dashboard Stats
export const DASHBOARD_STATS = {
  totalUsers: 5420,
  activeUsers: 4280,
  totalCourses: 256,
  activeCourses: 198,
  totalDepartments: 12,
  systemUptime: '99.9%',
  pendingRequests: 23,
  storageUsed: '2.4 TB',
  aiRequestsToday: 1250,
};

// Users Data
export const USERS = [
  { id: 1, name: 'Ahmed Hassan', email: 'ahmed.hassan@eduverse.edu', role: 'student', status: 'active', lastActive: '2026-02-03 10:30', department: 'Computer Science' },
  { id: 2, name: 'Dr. Sarah Martinez', email: 'sarah.martinez@eduverse.edu', role: 'instructor', status: 'active', lastActive: '2026-02-03 09:15', department: 'Computer Science' },
  { id: 3, name: 'Mohamed Ali', email: 'mohamed.ali@eduverse.edu', role: 'ta', status: 'active', lastActive: '2026-02-02 18:45', department: 'Engineering' },
  { id: 4, name: 'Fatima Khalil', email: 'fatima.khalil@eduverse.edu', role: 'student', status: 'inactive', lastActive: '2026-01-28 14:20', department: 'Business' },
  { id: 5, name: 'Dr. John Smith', email: 'john.smith@eduverse.edu', role: 'instructor', status: 'active', lastActive: '2026-02-03 11:00', department: 'Mathematics' },
  { id: 6, name: 'Layla Ahmed', email: 'layla.ahmed@eduverse.edu', role: 'student', status: 'suspended', lastActive: '2026-01-15 09:30', department: 'Arts' },
  { id: 7, name: 'Omar Ibrahim', email: 'omar.ibrahim@eduverse.edu', role: 'admin', status: 'active', lastActive: '2026-02-03 08:00', department: 'IT' },
  { id: 8, name: 'Nora Hassan', email: 'nora.hassan@eduverse.edu', role: 'student', status: 'active', lastActive: '2026-02-03 10:45', department: 'Science' },
];

// Courses Data
export const COURSES = [
  { id: 1, code: 'CS101', name: 'Introduction to Programming', department: 'Computer Science', semester: 'Fall 2025', credits: 3, enrolled: 120, capacity: 150, status: 'active', instructor: 'Dr. Sarah Martinez' },
  { id: 2, code: 'CS202', name: 'Data Structures', department: 'Computer Science', semester: 'Fall 2025', credits: 4, enrolled: 100, capacity: 120, status: 'active', instructor: 'Dr. Sarah Martinez' },
  { id: 3, code: 'MATH101', name: 'Calculus I', department: 'Mathematics', semester: 'Fall 2025', credits: 3, enrolled: 200, capacity: 250, status: 'active', instructor: 'Dr. John Smith' },
  { id: 4, code: 'ENG201', name: 'Thermodynamics', department: 'Engineering', semester: 'Fall 2025', credits: 4, enrolled: 80, capacity: 100, status: 'active', instructor: 'Dr. Ahmed Fathy' },
  { id: 5, code: 'BUS101', name: 'Business Fundamentals', department: 'Business', semester: 'Fall 2025', credits: 3, enrolled: 150, capacity: 200, status: 'active', instructor: 'Dr. Mona Saeed' },
  { id: 6, code: 'ART150', name: 'Digital Art', department: 'Arts', semester: 'Spring 2025', credits: 2, enrolled: 45, capacity: 50, status: 'archived', instructor: 'Prof. Amir Youssef' },
];

// Departments Data
export const DEPARTMENTS = [
  { id: 1, name: 'Computer Science', faculty: 'Engineering', head: 'Dr. Ahmed Fathy', courses: 24, students: 850, instructors: 18, budget: '$2.5M' },
  { id: 2, name: 'Mathematics', faculty: 'Science', head: 'Dr. John Smith', courses: 18, students: 620, instructors: 14, budget: '$1.8M' },
  { id: 3, name: 'Engineering', faculty: 'Engineering', head: 'Dr. Mohamed Nasser', courses: 32, students: 1200, instructors: 25, budget: '$4.2M' },
  { id: 4, name: 'Business', faculty: 'Commerce', head: 'Dr. Mona Saeed', courses: 20, students: 980, instructors: 16, budget: '$2.1M' },
  { id: 5, name: 'Arts', faculty: 'Humanities', head: 'Prof. Amir Youssef', courses: 15, students: 420, instructors: 10, budget: '$1.2M' },
  { id: 6, name: 'Science', faculty: 'Science', head: 'Dr. Hala Kamal', courses: 22, students: 750, instructors: 20, budget: '$2.8M' },
];

// Academic Calendar Events
export const CALENDAR_EVENTS = [
  { id: 1, title: 'Fall Semester Start', date: '2025-09-01', endDate: null, type: 'semesterStart', color: '#10b981' },
  { id: 2, title: 'Registration Period', date: '2025-08-15', endDate: '2025-08-30', type: 'registration', color: '#3b82f6' },
  { id: 3, title: 'National Day Holiday', date: '2025-10-15', endDate: null, type: 'holiday', color: '#ef4444' },
  { id: 4, title: 'Midterm Exams', date: '2025-10-20', endDate: '2025-10-30', type: 'examPeriod', color: '#f59e0b' },
  { id: 5, title: 'Winter Break', date: '2025-12-20', endDate: '2026-01-05', type: 'holiday', color: '#ef4444' },
  { id: 6, title: 'Final Exams', date: '2026-01-10', endDate: '2026-01-25', type: 'examPeriod', color: '#f59e0b' },
  { id: 7, title: 'Fall Semester End', date: '2026-01-30', endDate: null, type: 'semesterEnd', color: '#6366f1' },
  { id: 8, title: 'Spring Semester Start', date: '2026-02-10', endDate: null, type: 'semesterStart', color: '#10b981' },
];

// Analytics Data
export const ANALYTICS = {
  userGrowth: [
    { month: 'Sep', students: 4200, instructors: 180, admins: 12 },
    { month: 'Oct', students: 4450, instructors: 185, admins: 12 },
    { month: 'Nov', students: 4680, instructors: 190, admins: 14 },
    { month: 'Dec', students: 4820, instructors: 195, admins: 14 },
    { month: 'Jan', students: 5100, instructors: 200, admins: 15 },
    { month: 'Feb', students: 5420, instructors: 205, admins: 15 },
  ],
  courseEngagement: [
    { course: 'CS101', avgAttendance: 87, avgGrade: 82, activeStudents: 112 },
    { course: 'CS202', avgAttendance: 91, avgGrade: 78, activeStudents: 95 },
    { course: 'MATH101', avgAttendance: 82, avgGrade: 75, activeStudents: 185 },
    { course: 'ENG201', avgAttendance: 88, avgGrade: 80, activeStudents: 76 },
  ],
  aiUsage: [
    { feature: 'Quiz Generator', usage: 2450, trend: '+15%' },
    { feature: 'Content Summarizer', usage: 3200, trend: '+22%' },
    { feature: 'AI Chatbot', usage: 8500, trend: '+35%' },
    { feature: 'Voice to Text', usage: 1800, trend: '+10%' },
    { feature: 'Auto Grading', usage: 1200, trend: '+8%' },
  ],
  systemMetrics: {
    cpuUsage: 45,
    memoryUsage: 62,
    storageUsage: 48,
    networkLoad: 35,
  },
};

// Support Tickets
export const SUPPORT_TICKETS = [
  { id: 1, user: 'Ahmed Hassan', subject: 'Cannot access course materials', priority: 'high', status: 'pending', createdAt: '2026-02-03 09:00', category: 'Technical' },
  { id: 2, user: 'Dr. Sarah Martinez', subject: 'Grade submission error', priority: 'high', status: 'inProgress', createdAt: '2026-02-02 14:30', category: 'Technical' },
  { id: 3, user: 'Fatima Khalil', subject: 'Request for course enrollment', priority: 'medium', status: 'pending', createdAt: '2026-02-02 10:15', category: 'Academic' },
  { id: 4, user: 'Mohamed Ali', subject: 'Feature suggestion: Dark mode', priority: 'low', status: 'resolved', createdAt: '2026-01-28 16:45', category: 'Suggestion' },
  { id: 5, user: 'Nora Hassan', subject: 'Password reset not working', priority: 'high', status: 'resolved', createdAt: '2026-01-27 11:20', category: 'Technical' },
];

// Audit Logs
export const AUDIT_LOGS = [
  { id: 1, action: 'User Created', user: 'admin@eduverse.edu', target: 'new.user@eduverse.edu', timestamp: '2026-02-03 10:30', ip: '192.168.1.100' },
  { id: 2, action: 'Course Updated', user: 'sarah.martinez@eduverse.edu', target: 'CS101', timestamp: '2026-02-03 09:15', ip: '192.168.1.105' },
  { id: 3, action: 'Role Changed', user: 'admin@eduverse.edu', target: 'mohamed.ali@eduverse.edu', timestamp: '2026-02-02 18:00', ip: '192.168.1.100' },
  { id: 4, action: 'System Config Updated', user: 'admin@eduverse.edu', target: 'Gamification Settings', timestamp: '2026-02-02 15:30', ip: '192.168.1.100' },
  { id: 5, action: 'User Suspended', user: 'admin@eduverse.edu', target: 'layla.ahmed@eduverse.edu', timestamp: '2026-01-15 09:45', ip: '192.168.1.100' },
];

// Notification Templates
export const NOTIFICATION_TEMPLATES = [
  { id: 1, name: 'Welcome Message', type: 'email', subject: 'Welcome to EduVerse!', content: 'Dear {{name}}, Welcome to EduVerse platform...', lastUpdated: '2026-01-15' },
  { id: 2, name: 'Course Enrollment', type: 'email', subject: 'Course Enrollment Confirmation', content: 'You have been enrolled in {{courseName}}...', lastUpdated: '2026-01-20' },
  { id: 3, name: 'System Maintenance', type: 'broadcast', subject: 'Scheduled Maintenance', content: 'The system will be under maintenance on {{date}}...', lastUpdated: '2026-02-01' },
  { id: 4, name: 'Grade Posted', type: 'push', subject: 'New Grade Available', content: 'Your grade for {{assignment}} has been posted...', lastUpdated: '2026-01-25' },
];

// Gamification Settings
export const GAMIFICATION_SETTINGS = {
  pointsEnabled: true,
  badgesEnabled: true,
  leaderboardsEnabled: true,
  pointsConfig: {
    assignmentSubmission: 10,
    quizCompletion: 15,
    perfectScore: 50,
    attendance: 5,
    forumParticipation: 3,
  },
  badges: [
    { id: 1, name: 'First Steps', description: 'Complete your first assignment', icon: '🎯', enabled: true },
    { id: 2, name: 'Perfect Score', description: 'Get 100% on any quiz', icon: '⭐', enabled: true },
    { id: 3, name: 'Consistent Learner', description: 'Attend 10 classes in a row', icon: '🔥', enabled: true },
    { id: 4, name: 'Helping Hand', description: 'Help 5 students in forums', icon: '🤝', enabled: true },
    { id: 5, name: 'Course Champion', description: 'Complete a course with 90%+', icon: '🏆', enabled: false },
  ],
};

// API Integrations
export const API_INTEGRATIONS = [
  { id: 1, name: 'Moodle', status: 'connected', lastSync: '2026-02-03 08:00', syncFrequency: 'Every 6 hours', dataTypes: ['courses', 'grades', 'users'] },
  { id: 2, name: 'Blackboard', status: 'disconnected', lastSync: null, syncFrequency: null, dataTypes: [] },
  { id: 3, name: 'Google Classroom', status: 'connected', lastSync: '2026-02-03 06:00', syncFrequency: 'Daily', dataTypes: ['assignments', 'students'] },
  { id: 4, name: 'Microsoft Teams', status: 'pending', lastSync: null, syncFrequency: null, dataTypes: [] },
];

// Recent Activity
export const RECENT_ACTIVITY = [
  { type: 'user', title: 'New User Registration', description: '15 new students registered today', time: '2 hours ago' },
  { type: 'course', title: 'Course Created', description: 'CS303 - Advanced Algorithms added', time: '5 hours ago' },
  { type: 'system', title: 'System Backup Completed', description: 'Daily backup successful', time: '8 hours ago' },
  { type: 'alert', title: 'High Server Load', description: 'CPU usage peaked at 85%', time: '1 day ago' },
  { type: 'integration', title: 'Moodle Sync Completed', description: '256 records synchronized', time: '1 day ago' },
];
