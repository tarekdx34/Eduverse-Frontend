import type { Announcement } from '../../services/api/announcementService';
import type { CourseMaterial, SectionSchedule } from '../../services/api/courseService';
import type { TeachingCourse } from '../../services/api/enrollmentService';
import type { Lab } from '../../services/api/labService';

/** Same shape as `LiveStudentRow` in LiveModeViews / TADashboard */
export type MockLiveStudentRow = {
  id: string;
  userId: number;
  courseCode: string;
  courseName: string;
  sectionNumber: string;
  status: string;
  grade: string | null;
  finalScore: number | null;
  enrollmentDate: string;
};

export type MockLiveCourseDetailBundle = {
  course: TeachingCourse;
  instructorName: string;
  materials: CourseMaterial[];
  schedules: SectionSchedule[];
  labs: Lab[];
  announcements: Announcement[];
  students: MockLiveStudentRow[];
};

const semester = {
  id: 1,
  name: 'Fall 2025',
  startDate: '2025-09-01',
  endDate: '2025-12-20',
};

function labBase(courseId: string, overrides: Partial<Lab> & Pick<Lab, 'id' | 'title'>): Lab {
  return {
    courseId,
    description: 'Mock lab description',
    labNumber: 1,
    dueDate: '2025-11-20T23:59:59.000Z',
    availableFrom: '2025-10-01T00:00:00.000Z',
    maxScore: '100.00',
    weight: '10.00',
    status: 'published',
    createdBy: '0',
    createdAt: '2025-09-01T10:00:00.000Z',
    updatedAt: '2025-09-01T10:00:00.000Z',
    ...overrides,
  };
}

const MOCK_CS101: MockLiveCourseDetailBundle = {
  course: {
    sectionId: 10101,
    courseId: 101,
    course: {
      id: 101,
      name: 'Introduction to Programming',
      code: 'CS101',
      description: 'Mock course',
      credits: 3,
      level: '100',
    },
    section: {
      id: 10101,
      sectionNumber: '01',
      maxCapacity: 50,
      currentEnrollment: 45,
      location: 'Lab A-101',
    },
    semester,
  },
  instructorName: 'Dr. Jane Smith',
  schedules: [
    {
      id: 'sch-cs101-1',
      sectionId: '10101',
      dayOfWeek: 'Sunday',
      startTime: '10:00:00',
      endTime: '12:00:00',
      room: 'Lab A-101',
      building: 'CS Building',
      scheduleType: 'lab',
    },
  ],
  labs: [
    labBase('101', {
      id: 'mock-lab-cs101-1',
      title: 'Lab 1: Basic Syntax and Variables',
      labNumber: 1,
      status: 'published',
    }),
  ],
  materials: [
    {
      materialId: 'm-cs101-1',
      courseId: '101',
      materialType: 'slide',
      title: 'Week 1 — Course outline',
      weekNumber: 1,
      isPublished: 1,
      createdAt: '2025-09-02T12:00:00.000Z',
      updatedAt: '2025-09-02T12:00:00.000Z',
    },
  ],
  announcements: [
    {
      id: 'an-cs101-1',
      courseId: '101',
      createdBy: 1,
      title: 'Welcome to CS101',
      content: 'Mock announcement — not loaded from the API.',
      isPublished: 1,
      createdAt: '2025-09-03T09:00:00.000Z',
    },
  ],
  students: [
    {
      id: 'cs101-s1',
      userId: 90001,
      courseCode: 'CS101',
      courseName: 'Introduction to Programming',
      sectionNumber: '01',
      status: 'enrolled',
      grade: null,
      finalScore: null,
      enrollmentDate: '2025-09-05T10:00:00.000Z',
    },
    {
      id: 'cs101-s2',
      userId: 90002,
      courseCode: 'CS101',
      courseName: 'Introduction to Programming',
      sectionNumber: '01',
      status: 'enrolled',
      grade: 'B+',
      finalScore: 87,
      enrollmentDate: '2025-09-05T11:00:00.000Z',
    },
  ],
};

const MOCK_CS202: MockLiveCourseDetailBundle = {
  course: {
    sectionId: 20201,
    courseId: 202,
    course: {
      id: 202,
      name: 'Data Structures',
      code: 'CS202',
      description: 'Mock course',
      credits: 4,
      level: '200',
    },
    section: {
      id: 20201,
      sectionNumber: '02',
      maxCapacity: 40,
      currentEnrollment: 38,
      location: 'Room 204',
    },
    semester,
  },
  instructorName: 'Dr. Michael Brown',
  schedules: [
    {
      id: 'sch-cs202-1',
      sectionId: '20201',
      dayOfWeek: 'Tuesday',
      startTime: '14:00:00',
      endTime: '16:00:00',
      room: '204',
      building: 'Engineering',
      scheduleType: 'lecture',
    },
  ],
  labs: [
    labBase('202', {
      id: 'mock-lab-cs202-1',
      title: 'Lab 3: Binary Trees',
      labNumber: 3,
    }),
  ],
  materials: [
    {
      materialId: 'm-cs202-1',
      courseId: '202',
      materialType: 'document',
      title: 'Stacks and Queues (PDF)',
      weekNumber: 4,
      isPublished: 1,
      createdAt: '2025-09-10T12:00:00.000Z',
      updatedAt: '2025-09-10T12:00:00.000Z',
    },
  ],
  announcements: [],
  students: [
    {
      id: 'cs202-s1',
      userId: 90010,
      courseCode: 'CS202',
      courseName: 'Data Structures',
      sectionNumber: '02',
      status: 'enrolled',
      grade: null,
      finalScore: 72.5,
      enrollmentDate: '2025-09-06T08:00:00.000Z',
    },
  ],
};

const MOCK_CS303: MockLiveCourseDetailBundle = {
  course: {
    sectionId: 30301,
    courseId: 303,
    course: {
      id: 303,
      name: 'Advanced Algorithms',
      code: 'CS303',
      description: 'Mock course',
      credits: 3,
      level: '300',
    },
    section: {
      id: 30301,
      sectionNumber: '01',
      maxCapacity: 35,
      currentEnrollment: 32,
      location: 'Lab B-201',
    },
    semester,
  },
  instructorName: 'Dr. Sarah Johnson',
  schedules: [
    {
      id: 'sch-cs303-1',
      sectionId: '30301',
      dayOfWeek: 'Monday',
      startTime: '09:00:00',
      endTime: '10:30:00',
      room: 'B-201',
      building: 'Science Building',
      scheduleType: 'lecture',
    },
    {
      id: 'sch-cs303-2',
      sectionId: '30301',
      dayOfWeek: 'Wednesday',
      startTime: '09:00:00',
      endTime: '10:30:00',
      room: 'B-201',
      building: 'Science Building',
      scheduleType: 'tutorial',
    },
  ],
  labs: [
    labBase('303', {
      id: 'mock-lab-cs303-1',
      title: 'Lab 1: Graph Traversal',
      labNumber: 1,
      dueDate: '2025-10-30T23:59:59.000Z',
    }),
    labBase('303', {
      id: 'mock-lab-cs303-2',
      title: 'Lab 2: Dynamic Programming',
      labNumber: 2,
      dueDate: '2025-11-15T23:59:59.000Z',
      status: 'published',
    }),
  ],
  materials: [
    {
      materialId: 'm-cs303-1',
      courseId: '303',
      materialType: 'video',
      title: 'Greedy algorithms overview',
      weekNumber: 2,
      isPublished: 1,
      createdAt: '2025-09-08T12:00:00.000Z',
      updatedAt: '2025-09-08T12:00:00.000Z',
    },
    {
      materialId: 'm-cs303-2',
      courseId: '303',
      materialType: 'lecture',
      title: 'Amortized analysis',
      weekNumber: 5,
      isPublished: 1,
      createdAt: '2025-09-15T12:00:00.000Z',
      updatedAt: '2025-09-15T12:00:00.000Z',
    },
  ],
  announcements: [
    {
      id: 'an-cs303-1',
      courseId: '303',
      createdBy: 1,
      title: 'Midterm review session',
      content: 'Mock announcement text — compare with Live mode data from the server.',
      isPublished: 1,
      createdAt: '2025-10-01T15:00:00.000Z',
    },
  ],
  students: [
    {
      id: 'cs303-s1',
      userId: 90101,
      courseCode: 'CS303',
      courseName: 'Advanced Algorithms',
      sectionNumber: '01',
      status: 'enrolled',
      grade: null,
      finalScore: 91,
      enrollmentDate: '2025-09-04T12:00:00.000Z',
    },
    {
      id: 'cs303-s2',
      userId: 90102,
      courseCode: 'CS303',
      courseName: 'Advanced Algorithms',
      sectionNumber: '01',
      status: 'enrolled',
      grade: 'A-',
      finalScore: 88,
      enrollmentDate: '2025-09-04T13:00:00.000Z',
    },
    {
      id: 'cs303-s3',
      userId: 90103,
      courseCode: 'CS303',
      courseName: 'Advanced Algorithms',
      sectionNumber: '01',
      status: 'enrolled',
      grade: null,
      finalScore: null,
      enrollmentDate: '2025-09-05T09:00:00.000Z',
    },
  ],
};

/** Keys match `ASSIGNED_COURSES[].id` in constants.ts */
const BY_CARD_ID: Record<string, MockLiveCourseDetailBundle> = {
  cs101: MOCK_CS101,
  cs202: MOCK_CS202,
  cs303: MOCK_CS303,
};

export function getMockLiveCourseDetail(cardId: string | null): MockLiveCourseDetailBundle | null {
  if (!cardId) return null;
  return BY_CARD_ID[cardId] ?? null;
}
