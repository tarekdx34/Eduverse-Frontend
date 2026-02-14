export const TA_INFO = {
  name: 'Ahmed Hassan',
  email: 'ahmed.hassan@eduverse.edu',
  department: 'Computer Science',
};

// First names and last names for generating 150 students
const FIRST_NAMES = [
  'Mohamed', 'Ahmed', 'Omar', 'Youssef', 'Khaled', 'Fatima', 'Aisha', 'Layla', 'Mariam', 'Nour',
  'Hassan', 'Ibrahim', 'Ali', 'Mahmoud', 'Kareem', 'Sara', 'Dina', 'Nada', 'Hana', 'Lina',
  'Amr', 'Tarek', 'Waleed', 'Fadi', 'Rami', 'Yasmin', 'Salma', 'Reem', 'Dalia', 'Mona',
  'Karim', 'Bassem', 'Hossam', 'Sherif', 'Nader', 'Nourhan', 'Farida', 'Heba', 'Rania', 'Inas',
  'John', 'Michael', 'David', 'James', 'Robert', 'Emily', 'Sarah', 'Jessica', 'Emma', 'Olivia',
  'Daniel', 'Matthew', 'Andrew', 'Christopher', 'Joseph', 'Sophia', 'Isabella', 'Mia', 'Charlotte', 'Amelia',
  'Ryan', 'Kevin', 'Jason', 'Eric', 'Brian', 'Lily', 'Zoe', 'Chloe', 'Ella', 'Grace',
  'Adam', 'Nathan', 'Benjamin', 'Samuel', 'Owen', 'Ava', 'Evelyn', 'Abigail', 'Ella', 'Scarlett',
  'Noah', 'Liam', 'Mason', 'Ethan', 'Logan', 'Hannah', 'Victoria', 'Addison', 'Audrey', 'Brooklyn',
  'Lucas', 'Alexander', 'Sebastian', 'Jack', 'Aiden', 'Nora', 'Camila', 'Aria', 'Penelope', 'Riley',
  'Carter', 'Luke', 'Gabriel', 'Anthony', 'Isaac', 'Eleanor', 'Stella', 'Paisley', 'Savannah', 'Skylar',
  'Henry', 'Lincoln', 'Julian', 'Aaron', 'Hunter', 'Violet', 'Claire', 'Bella', 'Lucy', 'Anna',
  'Leo', 'Muhammad', 'Adrian', 'Connor', 'Thomas', 'Sofia', 'Caroline', 'Genesis', 'Aaliyah', 'Kennedy',
  'Charles', 'Josiah', 'Caleb', 'Christian', 'Eli', 'Allison', 'Natalie', 'Brooklyn', 'Alice', 'Sadie',
];

const LAST_NAMES = [
  'Ali', 'Hassan', 'Ahmed', 'Ibrahim', 'Mohamed', 'Khalil', 'Mahmoud', 'Salem', 'Rashid', 'Nasser',
  'El-Sayed', 'Fathy', 'Osman', 'Abdel', 'Hamza', 'Farouk', 'Zaki', 'Sabry', 'Hussein', 'Gamal',
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Wilson', 'Anderson', 'Taylor', 'Thomas', 'Moore', 'Jackson', 'Martin', 'Lee', 'Thompson', 'White',
  'Harris', 'Clark', 'Lewis', 'Robinson', 'Walker', 'Young', 'Hall', 'Allen', 'King', 'Wright',
];

// Generate 150 students with unique ids and names
function generateStudents(): { id: string; name: string }[] {
  const students: { id: string; name: string }[] = [];
  let nameIndex = 0;
  for (let i = 1; i <= 150; i++) {
    const first = FIRST_NAMES[nameIndex % FIRST_NAMES.length];
    const last = LAST_NAMES[Math.floor(nameIndex / FIRST_NAMES.length) % LAST_NAMES.length];
    students.push({ id: `stu${i}`, name: `${first} ${last}` });
    nameIndex++;
  }
  return students;
}

export const MOCK_STUDENTS = generateStudents();

// Course enrollment: stu1-50 -> cs101, stu51-100 -> cs202, stu101-150 -> cs303 (50 per course)
function getStudentsInCourse(courseId: string): { id: string; name: string }[] {
  if (courseId === 'cs101') return MOCK_STUDENTS.slice(0, 50);
  if (courseId === 'cs202') return MOCK_STUDENTS.slice(50, 100);
  if (courseId === 'cs303') return MOCK_STUDENTS.slice(100, 150);
  return [];
}

// Mock courses assigned to TA (studentCount 50 each, aligned with MOCK_STUDENTS)
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
    studentCount: 50,
    pendingSubmissions: 14,
    averageGrade: 84.2,
    attendanceRate: 91.5,
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
    studentCount: 50,
    pendingSubmissions: 12,
    averageGrade: 81.8,
    attendanceRate: 89.2,
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
    studentCount: 50,
    pendingSubmissions: 8,
    averageGrade: 79.5,
    attendanceRate: 86.0,
  },
];

// Mock labs (counts aligned with generated submissions below)
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
    submissionCount: 48,
    gradedCount: 45,
    attendanceCount: 49,
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
    materials: [
      { id: '3', name: 'Lab2_Manual.pdf', type: 'pdf', url: '#' },
    ],
    submissionCount: 44,
    gradedCount: 30,
    attendanceCount: 48,
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
    submissionCount: 46,
    gradedCount: 38,
    attendanceCount: 47,
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

// Seeded random for consistent fake data
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Generate submissions from MOCK_STUDENTS per lab
function generateSubmissions(): Record<string, any[]> {
  const out: Record<string, any[]> = {};
  let subId = 1;

  // lab1: cs101 -> 48 submissions from stu1-50, 45 graded, 3 submitted
  const lab1Students = getStudentsInCourse('cs101').slice(0, 48);
  out.lab1 = lab1Students.map((s, i) => {
    const graded = i < 45;
    const grade = graded ? Math.min(100, Math.floor(70 + seededRandom(s.id.length + i) * 28)) : undefined;
    return {
      id: `sub${subId++}`,
      labId: 'lab1',
      studentId: s.id,
      studentName: s.name,
      submittedAt: `2025-02-${13 + (i % 3)}T${10 + (i % 8)}:${(i % 60).toString().padStart(2, '0')}:00`,
      files: [{ id: `f${subId}`, name: `lab1_${s.id}.py`, size: `${(2 + seededRandom(i) * 4).toFixed(1)} KB` }],
      status: graded ? 'graded' : 'submitted',
      grade: grade ?? undefined,
      feedback: graded ? (grade >= 90 ? 'Excellent work!' : grade >= 80 ? 'Good implementation.' : 'Well done.') : undefined,
    };
  });

  // lab2: cs101 -> 44 submissions, 30 graded, 14 submitted
  const lab2Students = getStudentsInCourse('cs101').slice(0, 44);
  out.lab2 = lab2Students.map((s, i) => {
    const graded = i < 30;
    const grade = graded ? Math.min(100, Math.floor(68 + seededRandom(s.id.length + i + 100) * 30)) : undefined;
    return {
      id: `sub${subId++}`,
      labId: 'lab2',
      studentId: s.id,
      studentName: s.name,
      submittedAt: `2025-02-${20 + (i % 3)}T${9 + (i % 10)}:${(i % 60).toString().padStart(2, '0')}:00`,
      files: [{ id: `f${subId}`, name: `lab2_${s.id}.py`, size: `${(3 + seededRandom(i) * 5).toFixed(1)} KB` }],
      status: graded ? 'graded' : 'submitted',
      grade: grade ?? undefined,
      feedback: graded ? 'Good.' : undefined,
    };
  });

  // lab3: cs202 -> 46 submissions, 38 graded, 8 submitted
  const lab3Students = getStudentsInCourse('cs202').slice(0, 46);
  out.lab3 = lab3Students.map((s, i) => {
    const graded = i < 38;
    const grade = graded ? Math.min(100, Math.floor(65 + seededRandom(s.id.length + i + 200) * 32)) : undefined;
    return {
      id: `sub${subId++}`,
      labId: 'lab3',
      studentId: s.id,
      studentName: s.name,
      submittedAt: `2025-02-${19 + (i % 4)}T${12 + (i % 6)}:${(i % 60).toString().padStart(2, '0')}:00`,
      files: [{ id: `f${subId}`, name: `lab1_ds_${s.id}.zip`, size: `${(5 + seededRandom(i) * 8).toFixed(1)} KB` }],
      status: graded ? 'graded' : 'submitted',
      grade: grade ?? undefined,
      feedback: graded ? 'Well done.' : undefined,
    };
  });

  return out;
}

export const SUBMISSIONS = generateSubmissions();

// Student performance: 150 students with courses and grades derived from same mock data
function generateStudentPerformance(): any[] {
  return MOCK_STUDENTS.map((s, idx) => {
    const courses: any[] = [];
    if (idx < 50) {
      const avg = Math.min(100, Math.floor(72 + seededRandom(idx) * 26));
      const att = Math.min(100, Math.floor(85 + seededRandom(idx + 50) * 15));
      courses.push({
        courseId: 'cs101',
        courseName: 'Introduction to Programming',
        averageGrade: avg,
        attendanceRate: att,
        submissionCount: 2,
        lateSubmissions: seededRandom(idx + 100) > 0.9 ? 1 : 0,
      });
    } else if (idx < 100) {
      const avg = Math.min(100, Math.floor(70 + seededRandom(idx) * 28));
      const att = Math.min(100, Math.floor(82 + seededRandom(idx + 50) * 16));
      courses.push({
        courseId: 'cs202',
        courseName: 'Data Structures',
        averageGrade: avg,
        attendanceRate: att,
        submissionCount: 1,
        lateSubmissions: 0,
      });
    } else {
      const avg = Math.min(100, Math.floor(68 + seededRandom(idx) * 28));
      const att = Math.min(100, Math.floor(80 + seededRandom(idx + 50) * 18));
      courses.push({
        courseId: 'cs303',
        courseName: 'Advanced Algorithms',
        averageGrade: avg,
        attendanceRate: att,
        submissionCount: 0,
        lateSubmissions: 0,
      });
    }
    const overallAverage = courses.reduce((sum, c) => sum + c.averageGrade, 0) / courses.length;
    const overallAttendance = courses.reduce((sum, c) => sum + c.attendanceRate, 0) / courses.length;
    return {
      studentId: s.id,
      studentName: s.name,
      courses,
      overallAverage: Math.round(overallAverage * 10) / 10,
      overallAttendance: Math.round(overallAttendance * 10) / 10,
    };
  });
}

export const STUDENT_PERFORMANCE = generateStudentPerformance();

// Dashboard statistics derived from actual data
const allSubs = Object.values(SUBMISSIONS).flat();
export const DASHBOARD_STATS = {
  totalCourses: ASSIGNED_COURSES.length,
  activeLabs: LABS.filter((l) => l.status === 'active').length,
  pendingSubmissions: allSubs.filter((s: any) => s.status === 'submitted').length,
  averagePerformance: Math.round(
    STUDENT_PERFORMANCE.reduce((sum, s) => sum + s.overallAverage, 0) / STUDENT_PERFORMANCE.length * 10
  ) / 10,
  unreadMessages: 5,
  upcomingLabs: LABS.filter((l) => l.status === 'upcoming').length,
};

// Recent activity (reference students from MOCK_STUDENTS)
export const RECENT_ACTIVITY = [
  { id: 'act1', type: 'submission', message: `${MOCK_STUDENTS[0].name} submitted Lab 2`, timestamp: '2025-02-21T13:15:00', course: 'CS101' },
  { id: 'act2', type: 'question', message: `New question from ${MOCK_STUDENTS[1].name} about Lab 1`, timestamp: '2025-02-20T10:30:00', course: 'CS101' },
  { id: 'act3', type: 'grade', message: 'Graded 5 submissions for Lab 1', timestamp: '2025-02-19T16:45:00', course: 'CS101' },
  { id: 'act4', type: 'attendance', message: 'Marked attendance for Lab 1', timestamp: '2025-02-18T12:00:00', course: 'CS101' },
  { id: 'act5', type: 'submission', message: `${MOCK_STUDENTS[52].name} submitted Lab 3`, timestamp: '2025-02-20T14:20:00', course: 'CS202' },
  { id: 'act6', type: 'question', message: `New question from ${MOCK_STUDENTS[15].name} about Lab 2`, timestamp: '2025-02-21T09:00:00', course: 'CS101' },
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
