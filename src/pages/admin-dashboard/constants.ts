// Admin Dashboard Constants and Mock Data

export const ADMIN_INFO = {
  name: 'System Administrator',
  email: 'admin@eduverse.edu',
  role: 'Super Admin',
};

// Admin Department - each admin is scoped to their department
export const ADMIN_DEPARTMENT = 'Computer Science and Engineering';

// ============================================================
// 9 Engineering Departments — each with 6 professors, 8 TAs, ~150 students
// ============================================================
const DEPT_NAMES = [
  'Computer Science and Engineering', 'Electrical Engineering', 'Mechanical Engineering',
  'Civil Engineering', 'Architecture Engineering', 'Communication Engineering',
  'Biomedical Engineering', 'Mechatronics Engineering', 'Industrial Engineering',
] as const;

const DEPT_CODES = ['CSE', 'EE', 'ME', 'CE', 'ARC', 'COMM', 'BME', 'MTE', 'IE'] as const;

const PROFESSOR_NAMES: Record<string, string[]> = {
  'Computer Science and Engineering': ['Dr. Ahmed Fathy', 'Dr. Sarah Martinez', 'Dr. Khaled Mostafa', 'Dr. Nadia Hassan', 'Dr. Youssef Kamal', 'Dr. Rania Mahmoud'],
  'Electrical Engineering': ['Dr. Tarek Nour', 'Dr. Heba Salem', 'Dr. Amr Zaki', 'Dr. Samira El-Din', 'Dr. Wael Abdel-Aziz', 'Dr. Dina Rashad'],
  'Mechanical Engineering': ['Dr. Hassan Morsi', 'Dr. Mona El-Sayed', 'Dr. Ibrahim Farag', 'Dr. Laila Sobhy', 'Dr. Ashraf Helal', 'Dr. Noha Adel'],
  'Civil Engineering': ['Dr. Mohamed Nasser', 'Dr. Eman Khalil', 'Dr. Ali Abdallah', 'Dr. Hoda Fikry', 'Dr. Sherif Gamal', 'Dr. Yasmin Saleh'],
  'Architecture Engineering': ['Dr. Amir Youssef', 'Dr. Dalia Hafez', 'Dr. Kareem Tawfik', 'Dr. Salma Barakat', 'Dr. Hazem Lotfy', 'Dr. Mervat Said'],
  'Communication Engineering': ['Dr. Omar Shalaby', 'Dr. Fatma Ragab', 'Dr. Waleed Hamed', 'Dr. Neveen Attia', 'Dr. Bassem Rizk', 'Dr. Ghada Taha'],
  'Biomedical Engineering': ['Dr. Hossam Darwish', 'Dr. Reem Farouk', 'Dr. Mahmoud Anwar', 'Dr. Azza Moussa', 'Dr. Ehab Selim', 'Dr. Sahar Osman'],
  'Mechatronics Engineering': ['Dr. Karim Shaker', 'Dr. Abeer Nagib', 'Dr. Tamer Fouad', 'Dr. Hanan Abdel-Rahim', 'Dr. Mostafa Hendy', 'Dr. Iman Lotfy'],
  'Industrial Engineering': ['Dr. Adel Mansour', 'Dr. Suzan Mahfouz', 'Dr. Hesham Badr', 'Dr. Manal Refaat', 'Dr. Sameh Gaber', 'Dr. Naglaa Yehia'],
};

const TA_NAMES: Record<string, string[]> = {
  'Computer Science and Engineering': ['Eng. Mohamed Ali', 'Eng. Nour Ibrahim', 'Eng. Yara Tarek', 'Eng. Omar Hossam', 'Eng. Salma Adel', 'Eng. Karim Wael', 'Eng. Hana Sherif', 'Eng. Ali Khaled'],
  'Electrical Engineering': ['Eng. Rana Samir', 'Eng. Taha Mostafa', 'Eng. Dina Ashraf', 'Eng. Ahmed Reda', 'Eng. Maha Fouad', 'Eng. Seif Gamal', 'Eng. Lina Hassan', 'Eng. Ziad Nabil'],
  'Mechanical Engineering': ['Eng. Nada Emad', 'Eng. Sami Youssef', 'Eng. Farida Adel', 'Eng. Kareem Ramzy', 'Eng. Aya Magdy', 'Eng. Hazem Wael', 'Eng. Mariam Tamer', 'Eng. Bassem Lotfy'],
  'Civil Engineering': ['Eng. Hala Samy', 'Eng. Amr Khaled', 'Eng. Yasmine Fathy', 'Eng. Tarek Adel', 'Eng. Rania Saeed', 'Eng. Islam Nour', 'Eng. Dalia Ahmed', 'Eng. Mahmoud Hassan'],
  'Architecture Engineering': ['Eng. Sara Kamal', 'Eng. Khaled Tawfik', 'Eng. Lama Barakat', 'Eng. Youssef Sherif', 'Eng. Nermeen Said', 'Eng. Fady Hafez', 'Eng. Jana Lotfy', 'Eng. Wael Mervat'],
  'Communication Engineering': ['Eng. Amira Shalaby', 'Eng. Hamed Waleed', 'Eng. Shaimaa Ragab', 'Eng. Bassem Taha', 'Eng. Noura Rizk', 'Eng. Sherif Attia', 'Eng. Reem Hamed', 'Eng. Karim Fatma'],
  'Biomedical Engineering': ['Eng. Layla Darwish', 'Eng. Ahmad Farouk', 'Eng. Mona Anwar', 'Eng. Hossam Selim', 'Eng. Doaa Moussa', 'Eng. Ehab Osman', 'Eng. Rana Sahar', 'Eng. Tamer Reem'],
  'Mechatronics Engineering': ['Eng. Nadine Shaker', 'Eng. Omar Fouad', 'Eng. Salwa Nagib', 'Eng. Yehia Hendy', 'Eng. Abeer Abdel-Rahim', 'Eng. Mostafa Iman', 'Eng. Hagar Lotfy', 'Eng. Kamal Tamer'],
  'Industrial Engineering': ['Eng. Fatma Mansour', 'Eng. Hesham Mahfouz', 'Eng. Manal Badr', 'Eng. Sameh Refaat', 'Eng. Naglaa Gaber', 'Eng. Adel Yehia', 'Eng. Suzan Sameh', 'Eng. Gaber Manal'],
};

// Generate all users
let userId = 1;
const generatedUsers: { id: number; name: string; email: string; role: string; status: string; lastActive: string; department: string }[] = [];
DEPT_NAMES.forEach((dept, deptIdx) => {
  generatedUsers.push({ id: userId++, name: `Admin - ${dept.split(' ')[0]}`, email: `admin.${DEPT_CODES[deptIdx].toLowerCase()}@eduverse.edu`, role: 'admin', status: 'active', lastActive: '2026-02-03 08:00', department: dept });
  PROFESSOR_NAMES[dept].forEach(name => {
    generatedUsers.push({ id: userId++, name, email: `${name.replace('Dr. ', '').toLowerCase().replace(/ /g, '.')}@eduverse.edu`, role: 'instructor', status: 'active', lastActive: '2026-02-03 09:00', department: dept });
  });
  TA_NAMES[dept].forEach(name => {
    generatedUsers.push({ id: userId++, name, email: `${name.replace('Eng. ', '').toLowerCase().replace(/ /g, '.')}@eduverse.edu`, role: 'ta', status: 'active', lastActive: '2026-02-03 10:00', department: dept });
  });
  for (let s = 1; s <= 10; s++) {
    generatedUsers.push({ id: userId++, name: `Student ${DEPT_CODES[deptIdx]}-${s}`, email: `student${s}.${DEPT_CODES[deptIdx].toLowerCase()}@eduverse.edu`, role: 'student', status: 'active', lastActive: '2026-02-03 11:00', department: dept });
  }
});
export const USERS = generatedUsers;

// Courses (6 per department with proper prerequisite chains)
const COURSE_TEMPLATES: Record<string, { code: string; name: string; credits: number; prereqs: string[] }[]> = {
  'Computer Science and Engineering': [
    { code: 'CSE101', name: 'Introduction to Programming', credits: 3, prereqs: [] },
    { code: 'CSE201', name: 'Data Structures & Algorithms', credits: 4, prereqs: ['CSE101'] },
    { code: 'CSE202', name: 'Object-Oriented Programming', credits: 3, prereqs: ['CSE101'] },
    { code: 'CSE301', name: 'Database Systems', credits: 3, prereqs: ['CSE201'] },
    { code: 'CSE302', name: 'Operating Systems', credits: 3, prereqs: ['CSE201'] },
    { code: 'CSE401', name: 'Software Engineering', credits: 3, prereqs: ['CSE301', 'CSE302'] },
  ],
  'Electrical Engineering': [
    { code: 'EE101', name: 'Circuit Analysis', credits: 3, prereqs: [] },
    { code: 'EE201', name: 'Electronics I', credits: 4, prereqs: ['EE101'] },
    { code: 'EE202', name: 'Signals & Systems', credits: 3, prereqs: ['EE101'] },
    { code: 'EE301', name: 'Power Systems', credits: 3, prereqs: ['EE201'] },
    { code: 'EE302', name: 'Control Systems', credits: 3, prereqs: ['EE202'] },
    { code: 'EE401', name: 'VLSI Design', credits: 3, prereqs: ['EE301'] },
  ],
  'Mechanical Engineering': [
    { code: 'ME101', name: 'Engineering Mechanics', credits: 3, prereqs: [] },
    { code: 'ME201', name: 'Thermodynamics', credits: 4, prereqs: ['ME101'] },
    { code: 'ME202', name: 'Fluid Mechanics', credits: 3, prereqs: ['ME101'] },
    { code: 'ME301', name: 'Heat Transfer', credits: 3, prereqs: ['ME201'] },
    { code: 'ME302', name: 'Machine Design', credits: 3, prereqs: ['ME202'] },
    { code: 'ME401', name: 'Manufacturing Processes', credits: 3, prereqs: ['ME301', 'ME302'] },
  ],
  'Civil Engineering': [
    { code: 'CE101', name: 'Engineering Drawing', credits: 3, prereqs: [] },
    { code: 'CE201', name: 'Structural Analysis', credits: 4, prereqs: ['CE101'] },
    { code: 'CE202', name: 'Soil Mechanics', credits: 3, prereqs: ['CE101'] },
    { code: 'CE301', name: 'Reinforced Concrete', credits: 3, prereqs: ['CE201'] },
    { code: 'CE302', name: 'Foundation Engineering', credits: 3, prereqs: ['CE202'] },
    { code: 'CE401', name: 'Construction Management', credits: 3, prereqs: ['CE301'] },
  ],
  'Architecture Engineering': [
    { code: 'ARC101', name: 'Architectural Design I', credits: 3, prereqs: [] },
    { code: 'ARC201', name: 'Architectural Design II', credits: 4, prereqs: ['ARC101'] },
    { code: 'ARC202', name: 'History of Architecture', credits: 3, prereqs: [] },
    { code: 'ARC301', name: 'Urban Planning', credits: 3, prereqs: ['ARC201'] },
    { code: 'ARC302', name: 'Building Technology', credits: 3, prereqs: ['ARC201'] },
    { code: 'ARC401', name: 'Sustainable Design', credits: 3, prereqs: ['ARC301'] },
  ],
  'Communication Engineering': [
    { code: 'COMM101', name: 'Intro to Communication', credits: 3, prereqs: [] },
    { code: 'COMM201', name: 'Digital Communication', credits: 4, prereqs: ['COMM101'] },
    { code: 'COMM202', name: 'Electromagnetic Waves', credits: 3, prereqs: ['COMM101'] },
    { code: 'COMM301', name: 'Wireless Networks', credits: 3, prereqs: ['COMM201'] },
    { code: 'COMM302', name: 'Antenna Design', credits: 3, prereqs: ['COMM202'] },
    { code: 'COMM401', name: 'Optical Communication', credits: 3, prereqs: ['COMM301'] },
  ],
  'Biomedical Engineering': [
    { code: 'BME101', name: 'Intro to Biomedical Eng.', credits: 3, prereqs: [] },
    { code: 'BME201', name: 'Biomechanics', credits: 4, prereqs: ['BME101'] },
    { code: 'BME202', name: 'Medical Imaging', credits: 3, prereqs: ['BME101'] },
    { code: 'BME301', name: 'Biomedical Signals', credits: 3, prereqs: ['BME201'] },
    { code: 'BME302', name: 'Clinical Engineering', credits: 3, prereqs: ['BME202'] },
    { code: 'BME401', name: 'Rehabilitation Engineering', credits: 3, prereqs: ['BME301'] },
  ],
  'Mechatronics Engineering': [
    { code: 'MTE101', name: 'Intro to Mechatronics', credits: 3, prereqs: [] },
    { code: 'MTE201', name: 'Sensors & Actuators', credits: 4, prereqs: ['MTE101'] },
    { code: 'MTE202', name: 'Embedded Systems', credits: 3, prereqs: ['MTE101'] },
    { code: 'MTE301', name: 'Robotics', credits: 3, prereqs: ['MTE201', 'MTE202'] },
    { code: 'MTE302', name: 'PLC Programming', credits: 3, prereqs: ['MTE201'] },
    { code: 'MTE401', name: 'Autonomous Systems', credits: 3, prereqs: ['MTE301'] },
  ],
  'Industrial Engineering': [
    { code: 'IE101', name: 'Industrial Eng. Fundamentals', credits: 3, prereqs: [] },
    { code: 'IE201', name: 'Operations Research', credits: 4, prereqs: ['IE101'] },
    { code: 'IE202', name: 'Quality Control', credits: 3, prereqs: ['IE101'] },
    { code: 'IE301', name: 'Supply Chain Management', credits: 3, prereqs: ['IE201'] },
    { code: 'IE302', name: 'Production Planning', credits: 3, prereqs: ['IE202'] },
    { code: 'IE401', name: 'Lean Manufacturing', credits: 3, prereqs: ['IE301', 'IE302'] },
  ],
};

let courseId = 1;
const generatedCourses: any[] = [];
DEPT_NAMES.forEach((dept) => {
  const profs = generatedUsers.filter(u => u.role === 'instructor' && u.department === dept);
  const tas = generatedUsers.filter(u => u.role === 'ta' && u.department === dept);
  COURSE_TEMPLATES[dept].forEach((tmpl, i) => {
    generatedCourses.push({
      id: courseId++, code: tmpl.code, name: tmpl.name, department: dept, semester: 'Fall 2025',
      credits: tmpl.credits, enrolled: Math.floor(Math.random() * 100) + 50, capacity: 150, status: 'active',
      instructor: profs[i % profs.length].name, instructorId: profs[i % profs.length].id,
      taIds: [tas[i % tas.length].id, tas[(i + 1) % tas.length].id], prerequisites: tmpl.prereqs,
    });
  });
});
export const COURSES = generatedCourses;

// Departments (9 engineering)
export const DEPARTMENTS = DEPT_NAMES.map((name, i) => ({
  id: i + 1, name, faculty: 'Engineering', head: PROFESSOR_NAMES[name][0],
  courses: 6, students: 150, instructors: 6, tas: 8, budget: `$${(2 + Math.random() * 2).toFixed(1)}M`,
}));

// Schedules (CSE + EE sample data)
export const SCHEDULES = (() => {
  const s: any[] = []; let sid = 1;
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
  const rooms = ['Hall A-101', 'Hall A-102', 'Hall B-201', 'Lab C-101', 'Lab C-102', 'Hall D-301'];
  ['Computer Science and Engineering', 'Electrical Engineering'].forEach(dept => {
    const dc = generatedCourses.filter(c => c.department === dept);
    const pr = generatedUsers.filter(u => u.role === 'instructor' && u.department === dept);
    const ta = generatedUsers.filter(u => u.role === 'ta' && u.department === dept);
    dc.forEach((c, i) => {
      s.push({ id: sid++, courseId: c.id, courseCode: c.code, courseName: c.name, instructor: pr[i % pr.length].name, instructorId: pr[i % pr.length].id, day: days[i % days.length], startTime: `${String(9 + (i % 4)).padStart(2, '0')}:00`, endTime: `${String(10 + (i % 4)).padStart(2, '0')}:30`, room: rooms[i % rooms.length], type: 'lecture' as const, department: dept });
      s.push({ id: sid++, courseId: c.id, courseCode: c.code, courseName: c.name, instructor: ta[i % ta.length].name, instructorId: ta[i % ta.length].id, day: days[(i + 2) % days.length], startTime: `${String(11 + (i % 3)).padStart(2, '0')}:00`, endTime: `${String(12 + (i % 3)).padStart(2, '0')}:30`, room: rooms[(i + 3) % rooms.length], type: (i % 2 === 0 ? 'lab' : 'section') as const, department: dept });
    });
  });
  return s;
})();

// Enrollment Periods — ONE period per department per semester (students register for all courses they want)
export const ENROLLMENT_PERIODS = [
  { id: 1, department: 'Computer Science and Engineering', semester: 'Fall 2025', startDate: '2025-08-15', endDate: '2025-08-30', totalStudents: 150, registeredStudents: 142, status: 'closed' as const, description: 'Fall 2025 course registration window' },
  { id: 2, department: 'Electrical Engineering', semester: 'Fall 2025', startDate: '2025-08-15', endDate: '2025-08-30', totalStudents: 150, registeredStudents: 138, status: 'closed' as const, description: 'Fall 2025 course registration window' },
  { id: 3, department: 'Computer Science and Engineering', semester: 'Spring 2026', startDate: '2026-02-01', endDate: '2026-02-28', totalStudents: 150, registeredStudents: 67, status: 'active' as const, description: 'Spring 2026 — students select their courses (prerequisites enforced)' },
  { id: 4, department: 'Electrical Engineering', semester: 'Spring 2026', startDate: '2026-02-01', endDate: '2026-02-28', totalStudents: 150, registeredStudents: 54, status: 'active' as const, description: 'Spring 2026 — students select their courses (prerequisites enforced)' },
  { id: 5, department: 'Mechanical Engineering', semester: 'Spring 2026', startDate: '2026-03-01', endDate: '2026-03-15', totalStudents: 150, registeredStudents: 0, status: 'upcoming' as const, description: 'Spring 2026 registration — opens soon' },
];

// Exam Schedules
export const EXAM_SCHEDULES = (() => {
  const e: any[] = []; let eid = 1;
  const rooms = ['Exam Hall 1', 'Exam Hall 2', 'Exam Hall 3', 'Exam Hall 4'];
  ['Computer Science and Engineering', 'Electrical Engineering'].forEach(dept => {
    generatedCourses.filter(c => c.department === dept).forEach((c, i) => {
      e.push({ id: eid++, courseId: c.id, courseCode: c.code, courseName: c.name, examType: 'midterm' as const, date: `2025-10-${String(20 + i).padStart(2, '0')}`, startTime: '09:00', endTime: '11:00', room: rooms[i % rooms.length], duration: 120, department: dept });
      e.push({ id: eid++, courseId: c.id, courseCode: c.code, courseName: c.name, examType: 'final' as const, date: `2026-01-${String(10 + i).padStart(2, '0')}`, startTime: '09:00', endTime: '12:00', room: rooms[i % rooms.length], duration: 180, department: dept });
    });
  });
  return e;
})();

// Dashboard Stats
export const DASHBOARD_STATS = {
  totalUsers: USERS.length, activeUsers: USERS.filter(u => u.status === 'active').length,
  totalCourses: COURSES.length, activeCourses: COURSES.filter(c => c.status === 'active').length,
  totalDepartments: 9, systemUptime: '99.9%', pendingRequests: 23, storageUsed: '2.4 TB', aiRequestsToday: 1250,
};

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
