export const INSTRUCTOR_INFO = {
  name: 'Dr. Jane Smith',
  email: 'jane.smith@eduverse.edu',
  department: 'Computer Science',
};

// --- Fake data helpers ---
const FIRST_NAMES = [
  'Alice',
  'Noah',
  'Olivia',
  'Liam',
  'Emma',
  'Ava',
  'Sophia',
  'Isabella',
  'Mia',
  'Charlotte',
  'Amelia',
  'Harper',
  'Evelyn',
  'Abigail',
  'Emily',
  'Elizabeth',
  'Avery',
  'Sofia',
  'Ella',
  'Scarlett',
  'Madison',
  'Aria',
  'Chloe',
  'Grace',
  'Luna',
  'Zoe',
  'Penelope',
  'Riley',
  'Nora',
  'Lily',
  'Hannah',
  'Leah',
  'Lillian',
  'Addison',
  'Aubrey',
  'Stella',
  'Natalie',
  'Zoey',
  'Brooklyn',
  'Lucy',
  'Jackson',
  'Aiden',
  'Elijah',
  'Lucas',
  'Mason',
  'Caden',
  'Grayson',
  'Carter',
  'Wyatt',
  'Jayden',
];
const LAST_NAMES = [
  'Johnson',
  'Williams',
  'Brown',
  'Jones',
  'Garcia',
  'Miller',
  'Davis',
  'Rodriguez',
  'Martinez',
  'Hernandez',
  'Lopez',
  'Gonzalez',
  'Wilson',
  'Anderson',
  'Thomas',
  'Taylor',
  'Moore',
  'Jackson',
  'Martin',
  'Lee',
  'Perez',
  'Thompson',
  'White',
  'Harris',
  'Sanchez',
  'Clark',
  'Ramirez',
  'Lewis',
  'Robinson',
  'Walker',
  'Young',
  'Allen',
  'King',
  'Wright',
  'Scott',
  'Torres',
  'Nguyen',
  'Hill',
  'Flores',
  'Green',
];

function toSlug(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/\.+/g, '.')
    .replace(/^\.|\.$/g, '');
}

function makePerson(index: number) {
  const f = FIRST_NAMES[index % FIRST_NAMES.length];
  const l = LAST_NAMES[Math.floor(index / FIRST_NAMES.length) % LAST_NAMES.length];
  const name = `${f} ${l}`;
  const email = `${toSlug(f)}.${toSlug(l)}${index}@eduverse.edu`;
  return { name, email };
}

export const SECTIONS = [
  {
    sectionId: 101,
    courseCode: 'CS101',
    courseName: 'Introduction to Programming',
    sectionLabel: 'Section A',
    schedule: 'Sun/Tue 10:00 - 11:30',
    capacity: 180,
    enrolled: 120,
  },
  {
    sectionId: 202,
    courseCode: 'CS202',
    courseName: 'Data Structures',
    sectionLabel: 'Section B',
    schedule: 'Mon/Wed 12:00 - 13:30',
    capacity: 180,
    enrolled: 100,
  },
  {
    sectionId: 303,
    courseCode: 'CS303',
    courseName: 'Databases',
    sectionLabel: 'Section C',
    schedule: 'Thu 09:00 - 12:00',
    capacity: 180,
    enrolled: 90,
  },
];

function generateRoster(count: number, startIndex = 1) {
  const list: Array<{ id: number; name: string; email: string; status: string; grade?: string }> =
    [];
  for (let i = 0; i < count; i++) {
    const person = makePerson(startIndex + i);
    const status = 'enrolled';
    const gradePool = ['A', 'A-', 'B+', 'B', 'C+', 'C'];
    const grade =
      Math.random() < 0.85 ? gradePool[Math.floor(Math.random() * gradePool.length)] : undefined;
    list.push({ id: startIndex + i, name: person.name, email: person.email, status, grade });
  }
  return list;
}

export const ROSTERS: Record<
  string,
  Array<{ id: number; name: string; email: string; status: string; grade?: string }>
> = {
  '101': generateRoster(SECTIONS[0].enrolled, 1),
  '202': generateRoster(SECTIONS[1].enrolled, 1001),
  '303': generateRoster(SECTIONS[2].enrolled, 2001),
};

export const WAITLISTS: Record<
  string,
  Array<{ id: number; name: string; email: string; requestedAt: string }>
> = {
  '101': Array.from({ length: 12 }).map((_, idx) => {
    const p = makePerson(3000 + idx);
    return {
      id: 3000 + idx,
      name: p.name,
      email: p.email,
      requestedAt: `2025-11-${String(10 + (idx % 20)).padStart(2, '0')}`,
    };
  }),
  '202': Array.from({ length: 7 }).map((_, idx) => {
    const p = makePerson(4000 + idx);
    return {
      id: 4000 + idx,
      name: p.name,
      email: p.email,
      requestedAt: `2025-10-${String(5 + (idx % 20)).padStart(2, '0')}`,
    };
  }),
  '303': Array.from({ length: 10 }).map((_, idx) => {
    const p = makePerson(5000 + idx);
    return {
      id: 5000 + idx,
      name: p.name,
      email: p.email,
      requestedAt: `2025-12-${String(1 + (idx % 20)).padStart(2, '0')}`,
    };
  }),
};

export const DASHBOARD_STATS = [
  {
    label: 'Sections Teaching',
    value: SECTIONS.length,
    comparison: '+1 from last term',
    isPositive: true,
  },
  {
    label: 'Total Enrolled Students',
    value: SECTIONS.reduce((sum, s) => sum + s.enrolled, 0),
    comparison: '+5 this week',
    isPositive: true,
  },
  { label: 'Pending Grade Actions', value: 7, comparison: '-2 resolved', isPositive: true },
];

// Expanded datasets for rich tabs
function scoreToGrade(score: number): string {
  if (score >= 93) return 'A';
  if (score >= 90) return 'A-';
  if (score >= 87) return 'B+';
  if (score >= 83) return 'B';
  if (score >= 80) return 'B-';
  if (score >= 77) return 'C+';
  if (score >= 73) return 'C';
  return 'C-';
}

export const ASSIGNMENTS: Record<
  string,
  Array<{
    id: number;
    title: string;
    dueDate: string;
    submissions: number;
    status: 'draft' | 'open' | 'closed';
  }>
> = {
  '101': [
    {
      id: 11,
      title: 'Quiz 1: Variables & IO',
      dueDate: '2025-12-26',
      submissions: 98,
      status: 'closed',
    },
    {
      id: 12,
      title: 'Quiz 2: Control Flow',
      dueDate: '2026-01-02',
      submissions: 97,
      status: 'open',
    },
    { id: 13, title: 'Quiz 3: Functions', dueDate: '2026-01-09', submissions: 0, status: 'draft' },
    { id: 14, title: 'HW1: Basics', dueDate: '2025-12-28', submissions: 95, status: 'closed' },
    { id: 15, title: 'HW2: Arrays', dueDate: '2026-01-12', submissions: 20, status: 'open' },
    { id: 16, title: 'Midterm', dueDate: '2026-01-20', submissions: 0, status: 'draft' },
    { id: 17, title: 'Quiz 4: Recursion', dueDate: '2026-01-23', submissions: 0, status: 'draft' },
  ],
  '202': [
    { id: 21, title: 'Quiz 1: Complexity', dueDate: '2026-01-01', submissions: 96, status: 'open' },
    {
      id: 22,
      title: 'Quiz 2: Linked Lists',
      dueDate: '2026-01-05',
      submissions: 0,
      status: 'draft',
    },
    { id: 23, title: 'Quiz 3: Trees', dueDate: '2026-01-12', submissions: 0, status: 'draft' },
    {
      id: 24,
      title: 'HW1: Implement Stack',
      dueDate: '2026-01-08',
      submissions: 88,
      status: 'open',
    },
    {
      id: 25,
      title: 'HW2: Binary Search Tree',
      dueDate: '2026-01-15',
      submissions: 0,
      status: 'draft',
    },
    { id: 26, title: 'Midterm', dueDate: '2026-01-22', submissions: 0, status: 'draft' },
  ],
  '303': [
    {
      id: 31,
      title: 'Quiz 1: SQL Basics',
      dueDate: '2025-12-30',
      submissions: 98,
      status: 'closed',
    },
    { id: 32, title: 'Quiz 2: Joins', dueDate: '2026-01-06', submissions: 94, status: 'open' },
    { id: 33, title: 'Quiz 3: Indexing', dueDate: '2026-01-13', submissions: 0, status: 'draft' },
    { id: 34, title: 'HW1: ER Modeling', dueDate: '2026-01-05', submissions: 90, status: 'open' },
    { id: 35, title: 'Project: Mini DB', dueDate: '2026-01-27', submissions: 0, status: 'draft' },
  ],
};

// Build GRADES from rosters and a subset of assignments for each section
export const GRADES: Record<
  string,
  Array<{
    id: number;
    student: string;
    email: string;
    assignment: string;
    score: number;
    grade: string;
  }>
> = {
  '101': (() => {
    const roster = ROSTERS['101'];
    const titles = ASSIGNMENTS['101'].slice(0, 4).map((a) => a.title);
    const rows: any[] = [];
    let id = 1;
    for (const st of roster) {
      for (const t of titles) {
        const score = 75 + Math.floor(Math.random() * 26); // 75-100
        rows.push({
          id: id++,
          student: st.name,
          email: st.email,
          assignment: t,
          score,
          grade: scoreToGrade(score),
        });
      }
    }
    return rows;
  })(),
  '202': (() => {
    const roster = ROSTERS['202'];
    const titles = ASSIGNMENTS['202'].slice(0, 4).map((a) => a.title);
    const rows: any[] = [];
    let id = 100000;
    for (const st of roster) {
      for (const t of titles) {
        const score = 72 + Math.floor(Math.random() * 26); // 72-98
        rows.push({
          id: id++,
          student: st.name,
          email: st.email,
          assignment: t,
          score,
          grade: scoreToGrade(score),
        });
      }
    }
    return rows;
  })(),
  '303': (() => {
    const roster = ROSTERS['303'];
    const titles = ASSIGNMENTS['303'].slice(0, 4).map((a) => a.title);
    const rows: any[] = [];
    let id = 200000;
    for (const st of roster) {
      for (const t of titles) {
        const score = 70 + Math.floor(Math.random() * 26); // 70-96
        rows.push({
          id: id++,
          student: st.name,
          email: st.email,
          assignment: t,
          score,
          grade: scoreToGrade(score),
        });
      }
    }
    return rows;
  })(),
};

export const ATTENDANCE: Record<
  string,
  Array<{ id: number; date: string; present: number; absent: number }>
> = {
  '101': [
    { id: 1011, date: '2025-12-03', present: 116, absent: 4 },
    { id: 1012, date: '2025-12-10', present: 115, absent: 5 },
    { id: 1013, date: '2025-12-17', present: 114, absent: 6 },
    { id: 1014, date: '2025-12-24', present: 112, absent: 8 },
  ],
  '202': [
    { id: 2021, date: '2025-12-04', present: 95, absent: 5 },
    { id: 2022, date: '2025-12-11', present: 96, absent: 4 },
    { id: 2023, date: '2025-12-18', present: 94, absent: 6 },
    { id: 2024, date: '2025-12-25', present: 92, absent: 8 },
  ],
  '303': [
    { id: 3031, date: '2025-12-05', present: 86, absent: 4 },
    { id: 3032, date: '2025-12-12', present: 84, absent: 6 },
    { id: 3033, date: '2025-12-19', present: 83, absent: 7 },
  ],
};

export const MESSAGES: Array<{
  id: number;
  from: string;
  role: string;
  content: string;
  time: string;
}> = [
  {
    id: 501,
    from: 'Alice Johnson',
    role: 'Student',
    content: 'Could you clarify the project requirements?',
    time: '2025-12-20 14:10',
  },
  {
    id: 502,
    from: 'Dana White',
    role: 'Student',
    content: 'I will miss next class due to travel.',
    time: '2025-12-19 09:30',
  },
  {
    id: 503,
    from: 'Dept Admin',
    role: 'Admin',
    content: 'Grades submission deadline is Jan 15.',
    time: '2025-12-18 16:45',
  },
];

export const ANALYTICS = {
  gradeDistribution: { A: 180, 'A-': 120, B: 85, 'B+': 70, C: 40, 'C+': 30 },
  enrollmentTrend: [
    { month: 'Aug', count: 270 },
    { month: 'Sep', count: 300 },
    { month: 'Oct', count: 310 },
    { month: 'Nov', count: 305 },
    { month: 'Dec', count: 310 },
    { month: 'Jan', count: 320 },
  ],
};
// Profile Data
export const INSTRUCTOR_PROFILE = {
  name: 'Dr. Jane Smith',
  email: 'jane.smith@eduverse.edu',
  phone: '+1 (555) 123-4567',
  department: 'Computer Science',
  office: 'Building A, Room 305',
  officeHours: 'Mon/Wed 2:00 PM - 4:00 PM',
  bio: 'Passionate educator with over 15 years of experience in computer science education. Specializing in programming languages, data structures, and software engineering principles.',
  specialization: [
    'Programming Languages',
    'Data Structures',
    'Software Engineering',
    'Algorithm Design',
  ],
  education: [
    { degree: 'Ph.D. in Computer Science', institution: 'Stanford University', year: '2008' },
    { degree: 'M.S. in Computer Science', institution: 'MIT', year: '2004' },
    { degree: 'B.S. in Computer Engineering', institution: 'UC Berkeley', year: '2002' },
  ],
  achievements: [
    'Best Teacher Award 2023',
    'Published 25+ research papers in top-tier conferences',
    'Developed innovative curriculum for CS fundamentals',
    'Mentored 50+ undergraduate research projects',
  ],
  joinDate: 'September 2010',
};

// Dashboard Data
export const UPCOMING_CLASSES = [
  {
    time: '10:00 AM',
    course: 'Introduction to Programming',
    section: 'CS101-A',
    room: 'Room 201',
    enrolled: 120,
    status: 'upcoming',
  },
  {
    time: '12:00 PM',
    course: 'Data Structures',
    section: 'CS202-B',
    room: 'Room 305',
    enrolled: 100,
    status: 'upcoming',
  },
  {
    time: '02:00 PM',
    course: 'Advanced Algorithms',
    section: 'CS303-C',
    room: 'Lab 101',
    enrolled: 90,
    status: 'upcoming',
  },
];

export const PENDING_TASKS = [
  { title: 'Grade Quiz 2 submissions', course: 'CS101', priority: 'high', dueDate: 'Today' },
  { title: 'Prepare lecture slides', course: 'CS202', priority: 'medium', dueDate: 'Tomorrow' },
  { title: 'Review project proposals', course: 'CS303', priority: 'medium', dueDate: 'Dec 30' },
  { title: 'Submit final grades', course: 'CS101', priority: 'high', dueDate: 'Jan 5' },
  { title: 'Update course syllabus', course: 'CS202', priority: 'low', dueDate: 'Jan 10' },
];

export const RECENT_ACTIVITY = [
  {
    type: 'grade',
    title: 'Quiz 2 Graded',
    description: '98 submissions graded for CS101',
    time: '2 hours ago',
  },
  {
    type: 'assignment',
    title: 'HW2 Submitted',
    description: '95 students submitted HW2: Arrays',
    time: '5 hours ago',
  },
  {
    type: 'attendance',
    title: 'Attendance Recorded',
    description: 'CS202 - Section B: 96/100 present',
    time: '1 day ago',
  },
  {
    type: 'grade',
    title: 'Midterm Graded',
    description: 'CS303 midterm completed',
    time: '2 days ago',
  },
  {
    type: 'assignment',
    title: 'New Assignment Posted',
    description: 'Quiz 3: Functions posted to CS101',
    time: '3 days ago',
  },
];

// Extended Course Data
export const COURSES = [
  {
    id: 101,
    courseCode: 'CS101',
    courseName: 'Introduction to Programming',
    semester: 'Fall 2024',
    credits: 3,
    prerequisites: [],
    description:
      'Learn the fundamentals of programming using Python. Topics include variables, control structures, functions, and basic data structures.',
    enrolled: 120,
    capacity: 180,
    schedule: 'Sun/Tue 10:00 - 11:30',
    room: 'Room 201',
    status: 'active' as const,
    averageGrade: 85,
    attendanceRate: 87,
  },
  {
    id: 202,
    courseCode: 'CS202',
    courseName: 'Data Structures',
    semester: 'Fall 2024',
    credits: 4,
    prerequisites: ['CS101'],
    description:
      'Advanced data structures including trees, graphs, hash tables, and algorithm analysis.',
    enrolled: 100,
    capacity: 180,
    schedule: 'Mon/Wed 12:00 - 13:30',
    room: 'Room 305',
    status: 'active' as const,
    averageGrade: 82,
    attendanceRate: 90,
  },
  {
    id: 303,
    courseCode: 'CS303',
    courseName: 'Advanced Algorithms',
    semester: 'Fall 2024',
    credits: 4,
    prerequisites: ['CS202'],
    description:
      'Study of advanced algorithmic techniques including dynamic programming, greedy algorithms, and graph algorithms.',
    enrolled: 90,
    capacity: 180,
    schedule: 'Tue/Thu 14:00 - 15:30',
    room: 'Lab 101',
    status: 'active' as const,
    averageGrade: 88,
    attendanceRate: 92,
  },
  {
    id: 104,
    courseCode: 'CS104',
    courseName: 'Web Development',
    semester: 'Spring 2024',
    credits: 3,
    prerequisites: ['CS101'],
    description:
      'Introduction to web development with HTML, CSS, JavaScript, and modern frameworks.',
    enrolled: 85,
    capacity: 150,
    schedule: 'Mon/Wed 10:00 - 11:30',
    room: 'Lab 202',
    status: 'archived' as const,
    averageGrade: 86,
    attendanceRate: 88,
  },
];

// ============================================
// AI FEATURES MOCK DATA
// ============================================

// AI Attendance Mock Data
export const AI_ATTENDANCE_SESSIONS = [
  {
    id: 1,
    date: new Date('2024-12-20T10:00:00'),
    courseSection: 'CS101 - Section A',
    photoName: 'class_photo_dec20.jpg',
    totalDetected: 28,
    totalStudents: 30,
    results: [
      {
        studentId: 1,
        studentName: 'Ahmed Hassan',
        status: 'present' as const,
        confidence: 95,
        manualOverride: false,
      },
      {
        studentId: 2,
        studentName: 'Sara Mohamed',
        status: 'present' as const,
        confidence: 92,
        manualOverride: false,
      },
      {
        studentId: 3,
        studentName: 'Omar Ali',
        status: 'uncertain' as const,
        confidence: 65,
        manualOverride: false,
      },
      {
        studentId: 4,
        studentName: 'Fatima Khalil',
        status: 'present' as const,
        confidence: 88,
        manualOverride: false,
      },
      {
        studentId: 5,
        studentName: 'Youssef Ibrahim',
        status: 'absent' as const,
        confidence: 0,
        manualOverride: false,
      },
    ],
  },
];

// AI Quiz Generator Mock Questions
export const MOCK_GENERATED_QUIZ = {
  id: 1,
  sourcePDF: 'Chapter_3_Data_Structures.pdf',
  generatedAt: new Date(),
  questionType: 'mix' as const,
  difficulty: 'medium' as const,
  questions: [
    {
      id: 1,
      type: 'mcq' as const,
      question: 'What is the time complexity of binary search in a sorted array?',
      options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'],
      correctAnswer: 1,
      points: 5,
      difficulty: 'easy',
      topic: 'Algorithms',
    },
    {
      id: 2,
      type: 'mcq' as const,
      question: 'Which data structure uses LIFO (Last In First Out) principle?',
      options: ['Queue', 'Stack', 'Array', 'Linked List'],
      correctAnswer: 1,
      points: 5,
      difficulty: 'easy',
      topic: 'Data Structures',
    },
    {
      id: 3,
      type: 'written' as const,
      question:
        'Explain the difference between a stack and a queue. Provide real-world examples for each.',
      correctAnswer:
        'A stack follows LIFO principle while a queue follows FIFO. Stack example: browser back button. Queue example: printer queue.',
      points: 10,
      difficulty: 'medium',
      topic: 'Data Structures',
    },
    {
      id: 4,
      type: 'mcq' as const,
      question: 'What is the best case time complexity of QuickSort?',
      options: ['O(n)', 'O(n log n)', 'O(n)', 'O(log n)'],
      correctAnswer: 1,
      points: 5,
      difficulty: 'medium',
      topic: 'Sorting Algorithms',
    },
    {
      id: 5,
      type: 'written' as const,
      question:
        'Describe how a hash table handles collisions. Mention at least two collision resolution techniques.',
      correctAnswer:
        'Hash tables handle collisions using techniques like chaining (linked lists) and open addressing (linear probing, quadratic probing).',
      points: 10,
      difficulty: 'hard',
      topic: 'Hash Tables',
    },
  ],
};

// AI Grading Suggestions Mock Data
export const MOCK_GRADING_SUGGESTIONS = [
  {
    submissionId: 1,
    studentName: 'Ahmed Hassan',
    suggestedScore: 85,
    maxScore: 100,
    confidence: 92,
    feedback:
      'Excellent work! Your implementation of the binary search algorithm is correct and efficient. Consider adding more edge case handling.',
    rubricBreakdown: [
      {
        criterion: 'Code Correctness',
        score: 25,
        maxScore: 30,
        comment: 'Algorithm works correctly for most cases',
      },
      {
        criterion: 'Code Efficiency',
        score: 20,
        maxScore: 20,
        comment: 'Optimal time complexity achieved',
      },
      {
        criterion: 'Code Style',
        score: 15,
        maxScore: 20,
        comment: 'Good naming conventions, needs more comments',
      },
      {
        criterion: 'Documentation',
        score: 15,
        maxScore: 20,
        comment: 'Basic documentation present',
      },
      { criterion: 'Testing', score: 10, maxScore: 10, comment: 'Comprehensive test cases' },
    ],
  },
  {
    submissionId: 2,
    studentName: 'Sara Mohamed',
    suggestedScore: 92,
    maxScore: 100,
    confidence: 95,
    feedback:
      'Outstanding submission! Your code is well-structured, efficient, and thoroughly documented. Great job on edge case handling.',
    rubricBreakdown: [
      { criterion: 'Code Correctness', score: 28, maxScore: 30, comment: 'Perfect implementation' },
      { criterion: 'Code Efficiency', score: 20, maxScore: 20, comment: 'Optimal solution' },
      { criterion: 'Code Style', score: 18, maxScore: 20, comment: 'Excellent code style' },
      { criterion: 'Documentation', score: 18, maxScore: 20, comment: 'Very well documented' },
      { criterion: 'Testing', score: 8, maxScore: 10, comment: 'Good test coverage' },
    ],
  },
];

// AI Feedback Templates
export const FEEDBACK_TEMPLATES = [
  {
    id: 1,
    name: 'Encouragement',
    category: 'positive',
    template:
      'Great progress, {{studentName}}! Your recent performance in {{assignmentName}} shows significant improvement. Keep up the excellent work!',
  },
  {
    id: 2,
    name: 'Needs Improvement',
    category: 'constructive',
    template:
      "Hi {{studentName}}, I noticed you scored {{grade}}% on {{assignmentName}}. Let's work together to improve your understanding of {{topic}}. Please see me during office hours.",
  },
  {
    id: 3,
    name: 'Missing Assignment',
    category: 'reminder',
    template:
      "Dear {{studentName}}, you haven't submitted {{assignmentName}} yet. The deadline is {{deadline}}. Please submit as soon as possible to avoid penalties.",
  },
];

// Content Summary Mock Data
export const MOCK_CONTENT_SUMMARY = {
  id: 1,
  sourceFile: 'Lecture_5_Advanced_Topics.pdf',
  summaryLength: 'moderate' as const,
  generatedAt: new Date(),
  summary:
    'This lecture covers advanced data structures including AVL trees, Red-Black trees, and B-trees. Key concepts include tree balancing, rotation operations, and performance analysis. The material also discusses practical applications in database indexing and file systems.',
  keyPoints: [
    'AVL trees maintain balance through rotation operations',
    'Red-Black trees use color properties for balancing',
    'B-trees are optimized for disk-based storage',
    'Time complexity for balanced trees is O(log n)',
    'Self-balancing trees are crucial for database performance',
  ],
  concepts: [
    'Tree Balancing',
    'Rotation Operations',
    'AVL Trees',
    'Red-Black Trees',
    'B-Trees',
    'Database Indexing',
  ],
  sharedWithStudents: false,
};

// Weak Topics Analysis Mock Data
export const MOCK_WEAK_TOPICS_ANALYSIS = {
  courseId: 101,
  analyzedAt: new Date(),
  period: { start: new Date('2024-09-01'), end: new Date('2024-12-20') },
  weakTopics: [
    {
      topic: 'Recursion',
      averageScore: 62,
      studentsStruggling: 15,
      recommendedAction: 'Schedule extra practice session',
    },
    {
      topic: 'Dynamic Programming',
      averageScore: 58,
      studentsStruggling: 18,
      recommendedAction: 'Provide additional examples and exercises',
    },
    {
      topic: 'Graph Algorithms',
      averageScore: 65,
      studentsStruggling: 12,
      recommendedAction: 'Create visual demonstrations',
    },
  ],
  atRiskStudents: [
    {
      studentId: 3,
      studentName: 'Omar Ali',
      weakTopics: ['Recursion', 'Dynamic Programming'],
      overallScore: 68,
    },
    {
      studentId: 7,
      studentName: 'Layla Ahmed',
      weakTopics: ['Graph Algorithms', 'Dynamic Programming'],
      overallScore: 64,
    },
    { studentId: 12, studentName: 'Khaled Samir', weakTopics: ['Recursion'], overallScore: 70 },
  ],
};
