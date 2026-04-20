import {
  Download,
  Filter,
  Search,
  Target,
  GraduationCap,
  TrendingUp,
  BookOpen,
  Award,
  Loader2,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { GradeAnalysis } from './GradeAnalysis';
import { useApi } from '../../../hooks/useApi';
import { GradesService, GradeRecord as ApiGradeRecord } from '../../../services/api/gradesService';
import { useAuth } from '../../../context/AuthContext';
import { client } from '../../../services/api/client';

/** Theme primary as `rgba()` for soft gradients (profile color picker). */
function primaryAlpha(hex: string, a: number): string {
  let h = hex.replace('#', '').trim();
  if (h.length === 3) {
    h = h
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const n = parseInt(h, 16);
  if (Number.isNaN(n) || h.length !== 6) {
    return `rgba(59, 130, 246, ${a})`;
  }
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${a})`;
}

interface GradeRecord {
  code: string;
  name: string;
  credits: number;
  percentage: number;
  grade: string;
  points: number;
  status: 'Completed' | 'In Progress';
}

interface SemesterData {
  semester: string;
  gpa: number;
  credits: number;
  courses: GradeRecord[];
}

interface GradesTranscriptProps {
  cumulativeGPA?: number;
  currentSemesterGPA?: number;
  totalCredits?: number;
  classRank?: number;
  semesters?: SemesterData[];
}

const defaultSemesters: SemesterData[] = [
  {
    semester: 'Spring 2025',
    gpa: 3.63,
    credits: 20,
    courses: [
      {
        code: 'CS101',
        name: 'Introduction to Computer Science',
        credits: 3,
        percentage: 95,
        grade: 'A',
        points: 4.0,
        status: 'Completed',
      },
      {
        code: 'CS201',
        name: 'Data Structures & Algorithms',
        credits: 4,
        percentage: 87,
        grade: 'B+',
        points: 3.5,
        status: 'Completed',
      },
      {
        code: 'CS150',
        name: 'Web Development Fundamentals',
        credits: 3,
        percentage: 92,
        grade: 'A-',
        points: 3.7,
        status: 'Completed',
      },
      {
        code: 'CS220',
        name: 'Database Management Systems',
        credits: 3,
        percentage: 83,
        grade: 'B',
        points: 3.0,
        status: 'In Progress',
      },
      {
        code: 'CS305',
        name: 'Software Engineering Principles',
        credits: 4,
        percentage: 96,
        grade: 'A',
        points: 4.0,
        status: 'In Progress',
      },
      {
        code: 'CS350',
        name: 'Mobile Application Development',
        credits: 3,
        percentage: 88,
        grade: 'B+',
        points: 3.5,
        status: 'In Progress',
      },
    ],
  },
  {
    semester: 'Fall 2024',
    gpa: 3.85,
    credits: 18,
    courses: [
      {
        code: 'CS100',
        name: 'Programming Fundamentals',
        credits: 3,
        percentage: 95,
        grade: 'A',
        points: 4.0,
        status: 'Completed',
      },
      {
        code: 'MATH101',
        name: 'Calculus I',
        credits: 4,
        percentage: 90,
        grade: 'A-',
        points: 3.7,
        status: 'Completed',
      },
      {
        code: 'ENG101',
        name: 'English Composition',
        credits: 3,
        percentage: 88,
        grade: 'B+',
        points: 3.5,
        status: 'Completed',
      },
      {
        code: 'PHY101',
        name: 'Physics I',
        credits: 4,
        percentage: 92,
        grade: 'A',
        points: 4.0,
        status: 'Completed',
      },
      {
        code: 'CS110',
        name: 'Discrete Mathematics',
        credits: 4,
        percentage: 91,
        grade: 'A-',
        points: 3.7,
        status: 'Completed',
      },
    ],
  },
  {
    semester: 'Spring 2024',
    gpa: 3.65,
    credits: 16,
    courses: [
      {
        code: 'CS120',
        name: 'Object-Oriented Programming',
        credits: 4,
        percentage: 88,
        grade: 'B+',
        points: 3.5,
        status: 'Completed',
      },
      {
        code: 'MATH102',
        name: 'Calculus II',
        credits: 4,
        percentage: 83,
        grade: 'B',
        points: 3.0,
        status: 'Completed',
      },
      {
        code: 'ENG102',
        name: 'Technical Writing',
        credits: 3,
        percentage: 92,
        grade: 'A',
        points: 4.0,
        status: 'Completed',
      },
      {
        code: 'CS130',
        name: 'Computer Architecture',
        credits: 3,
        percentage: 88,
        grade: 'B+',
        points: 3.5,
        status: 'Completed',
      },
      {
        code: 'STAT101',
        name: 'Statistics',
        credits: 2,
        percentage: 91,
        grade: 'A-',
        points: 3.7,
        status: 'Completed',
      },
    ],
  },
];

const getGradeColor = (grade: string, isDark: boolean) => {
  if (isDark) {
    if (grade.startsWith('A'))
      return { bg: 'bg-green-900/50', text: 'text-green-400', border: 'border-green-700' };
    if (grade.startsWith('B'))
      return { bg: 'bg-blue-900/50', text: 'text-blue-400', border: 'border-blue-700' };
    if (grade.startsWith('C'))
      return { bg: 'bg-yellow-900/50', text: 'text-yellow-400', border: 'border-yellow-700' };
    return { bg: 'bg-red-900/50', text: 'text-red-400', border: 'border-red-700' };
  }
  if (grade.startsWith('A'))
    return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' };
  if (grade.startsWith('B'))
    return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
  if (grade.startsWith('C'))
    return { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' };
  return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' };
};

const getStatusColor = (status: string, isDark: boolean) => {
  if (isDark) {
    return status === 'Completed'
      ? 'bg-green-900/50 text-green-400'
      : 'bg-yellow-900/50 text-yellow-400';
  }
  return status === 'Completed' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700';
};

const StatCard = ({
  label,
  value,
  subtext,
  icon: Icon,
  color,
  isDark,
}: {
  label: string;
  value: string | number;
  subtext: string;
  icon: any;
  color: 'violet' | 'green' | 'purple' | 'orange';
  isDark: boolean;
}) => {
  const getColors = () => {
    switch (color) {
      case 'violet':
        return isDark
          ? 'bg-blue-900/40 text-blue-400'
          : 'bg-blue-50 text-blue-600 border border-blue-100';
      case 'green':
        return isDark
          ? 'bg-emerald-900/40 text-emerald-400'
          : 'bg-emerald-50 text-emerald-600 border border-emerald-100';
      case 'purple':
        return isDark
          ? 'bg-blue-900/40 text-blue-400'
          : 'bg-blue-50 text-blue-600 border border-blue-100';
      case 'orange':
        return isDark
          ? 'bg-orange-900/40 text-orange-400'
          : 'bg-orange-50 text-orange-600 border border-orange-100';
      default:
        return isDark
          ? 'bg-white/5 text-white'
          : 'bg-slate-50 text-slate-600 border border-slate-100';
    }
  };

  return (
    <div
      className={`p-6 rounded-[2.5rem] flex justify-between items-start gap-4 hover:scale-[1.02] transition-all duration-300 group ${isDark ? 'bg-card-dark border border-white/5' : 'glass border border-white/40'}`}
    >
      <div className="flex-1">
        <p
          className={`text-sm font-medium mb-2 ${isDark ? 'text-slate-500 uppercase tracking-wider' : 'text-slate-500'}`}
        >
          {label}
        </p>
        <p className={`text-3xl font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-800'}`}>
          {value}
        </p>
        <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400 font-medium'}`}>
          {subtext}
        </p>
      </div>
      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-12 ${getColors()}`}
      >
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
};

const GradeTable = ({
  semester,
  courses,
  isDark,
}: {
  semester: SemesterData;
  courses: GradeRecord[];
  isDark: boolean;
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCourses] = useState(courses);

  return (
    <div
      className={`rounded-[2.5rem] overflow-hidden ${isDark ? 'bg-card-dark border border-white/5' : 'glass'}`}
    >
      {/* Header */}
      <div className={`border-b p-6 ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
              {semester.semester}
            </h3>
            <p className={`text-sm mt-1 ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
              GPA: {semester.gpa} | Credits: {semester.credits}
            </p>
          </div>
          <button
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${isDark ? 'border-white/10 hover:bg-white/5 text-slate-400' : 'border-slate-100 hover:bg-slate-50'}`}
          >
            <Download size={16} />
            <span className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
              Export
            </span>
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 relative">
            <Search
              size={16}
              className={`absolute left-3 top-3 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}
            />
            <input
              type="text"
              placeholder="Search courses"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-slate-500' : 'border-slate-100'}`}
            />
          </div>
          <button
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${isDark ? 'border-white/10 hover:bg-white/5 text-slate-400' : 'border-slate-100 hover:bg-slate-50'}`}
          >
            <Filter size={16} />
            <span className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
              Filter
            </span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download size={16} />
            <span className="text-sm font-medium">Download</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr
              className={`border-b ${isDark ? 'bg-white/5 border-white/5' : 'bg-background-light border-slate-100'}`}
            >
              <th
                className={`px-3 py-2 md:px-6 md:py-4 text-left text-sm font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
              >
                Course Code
              </th>
              <th
                className={`px-3 py-2 md:px-6 md:py-4 text-left text-sm font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
              >
                Course Name
              </th>
              <th
                className={`px-3 py-2 md:px-6 md:py-4 text-center text-sm font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
              >
                Credits
              </th>
              <th
                className={`px-3 py-2 md:px-6 md:py-4 text-center text-sm font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
              >
                Percentage
              </th>
              <th
                className={`px-3 py-2 md:px-6 md:py-4 text-center text-sm font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
              >
                Grade
              </th>
              <th
                className={`px-3 py-2 md:px-6 md:py-4 text-center text-sm font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
              >
                Points
              </th>
              <th
                className={`px-3 py-2 md:px-6 md:py-4 text-center text-sm font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
              >
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredCourses.map((course) => {
              const gradeColor = getGradeColor(course.grade, isDark);
              return (
                <tr
                  key={course.code}
                  className={`border-b transition-colors ${isDark ? 'border-white/5 hover:bg-white/5/50' : 'border-slate-100 hover:bg-slate-50'}`}
                >
                  <td
                    className={`px-3 py-2 md:px-6 md:py-4 text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}
                  >
                    {course.code}
                  </td>
                  <td
                    className={`px-3 py-2 md:px-6 md:py-4 text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}
                  >
                    {course.name}
                  </td>
                  <td
                    className={`px-3 py-2 md:px-6 md:py-4 text-sm text-center ${isDark ? 'text-slate-500' : 'text-slate-600'}`}
                  >
                    {course.credits}
                  </td>
                  <td
                    className={`px-3 py-2 md:px-6 md:py-4 text-sm text-center ${isDark ? 'text-white' : 'text-slate-800'}`}
                  >
                    {course.percentage}%
                  </td>
                  <td className="px-3 py-2 md:px-6 md:py-4 text-center">
                    <div
                      className={`inline-block px-3 py-1 rounded ${gradeColor.bg} ${gradeColor.text} text-sm font-medium border ${gradeColor.border}`}
                    >
                      {course.grade}
                    </div>
                  </td>
                  <td
                    className={`px-3 py-2 md:px-6 md:py-4 text-sm font-medium text-center ${isDark ? 'text-white' : 'text-slate-800'}`}
                  >
                    {course.points}
                  </td>
                  <td className="px-3 py-2 md:px-6 md:py-4 text-center">
                    <span
                      className={`inline-block px-3 py-1 rounded text-sm font-medium ${getStatusColor(course.status, isDark)}`}
                    >
                      {course.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
          {/* Footer Summary */}
          <tfoot>
            <tr
              className={`border-t ${isDark ? 'bg-white/5 border-white/5' : 'bg-background-light border-slate-100'}`}
            >
              <td
                colSpan={2}
                className={`px-3 py-2 md:px-6 md:py-4 text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}
              >
                Total
              </td>
              <td
                className={`px-3 py-2 md:px-6 md:py-4 text-center text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}
              >
                {filteredCourses.reduce((sum, c) => sum + c.credits, 0)} Credits
              </td>
              <td />
              <td />
              <td
                className={`px-3 py-2 md:px-6 md:py-4 text-center text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}
              >
                GPA: {semester.gpa}
              </td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

interface ApiGradeResponse {
  id: string | number;
  userId: number;
  courseId: string | number;
  gradeType: 'assignment' | 'quiz' | 'lab';
  assignmentId: string | number | null;
  quizId: string | number | null;
  labId: string | number | null;
  score: string | number;
  maxScore: string | number;
  percentage: string | number;
  letterGrade: string;
  feedback: string | null;
  isPublished: number;
  course: {
    id: string | number;
    name: string;
    code: string;
  };
  assignment?: {
    id: string | number;
    title: string;
    dueDate?: string;
    maxScore?: string | number;
  };
  quiz?: {
    id: string | number;
    title: string;
    dueDate?: string;
    maxScore?: string | number;
  };
  lab?: {
    id: string | number;
    title: string;
    dueDate?: string;
    maxScore?: string | number;
  };
}

const getItemTitle = (grade: ApiGradeResponse): string => {
  switch (grade.gradeType) {
    case 'assignment':
      return grade.assignment?.title || 'Assignment';
    case 'quiz':
      return grade.quiz?.title || 'Quiz';
    case 'lab':
      return grade.lab?.title || 'Lab';
    default:
      return 'N/A';
  }
};

const getGradeTypeBadge = (gradeType: string, isDark: boolean) => {
  const badges: Record<string, { bg: string; text: string }> = {
    assignment: isDark
      ? { bg: 'bg-blue-900/50', text: 'text-blue-400' }
      : { bg: 'bg-blue-50', text: 'text-blue-700' },
    quiz: isDark
      ? { bg: 'bg-purple-900/50', text: 'text-purple-400' }
      : { bg: 'bg-purple-50', text: 'text-purple-700' },
    lab: isDark
      ? { bg: 'bg-orange-900/50', text: 'text-orange-400' }
      : { bg: 'bg-orange-50', text: 'text-orange-700' },
  };
  return badges[gradeType] || badges.assignment;
};

export default function GradesTranscript({
  cumulativeGPA: propCumulativeGPA = 3.75,
  currentSemesterGPA: propCurrentSemesterGPA = 3.62,
  totalCredits: propTotalCredits = 120,
  classRank = 15,
  semesters: propSemesters = defaultSemesters,
}: GradesTranscriptProps) {
  const { t, isRTL } = useLanguage();
  const { isDark, primaryHex } = useTheme();
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<'grades' | 'analysis'>('grades');
  const [rawGrades, setRawGrades] = useState<ApiGradeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cumulativeGPA, setCumulativeGPA] = useState(propCumulativeGPA);
  const [currentSemesterGPA, setCurrentSemesterGPA] = useState(propCurrentSemesterGPA);

  // Fetch grades from API
  useEffect(() => {
    const fetchGrades = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch grades using the API client
        const response = await client.get('/grades/my');
        const grades = Array.isArray(response) ? response : response.data;
        setRawGrades(grades);

        // Fetch GPA if user is available
        if (user?.userId) {
          try {
            const gpaResponse = await client.get(`/grades/gpa/${user.userId}`);
            if (gpaResponse.semesterGpa) setCurrentSemesterGPA(Number(gpaResponse.semesterGpa));
            if (gpaResponse.cumulativeGpa) setCumulativeGPA(Number(gpaResponse.cumulativeGpa));
          } catch (gpaError) {
            console.error('Failed to fetch GPA:', gpaError);
          }
        }
      } catch (err) {
        console.error('Failed to fetch grades:', err);
        setError(err instanceof Error ? err.message : 'Failed to load grades');
        setRawGrades([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, [user?.userId]);

  // Group grades by course
  const gradesByCourse = rawGrades.reduce(
    (acc, grade) => {
      const courseKey = String(grade.courseId);
      if (!acc[courseKey]) {
        acc[courseKey] = {
          courseId: grade.courseId,
          courseName: grade.course.name,
          courseCode: grade.course.code,
          grades: [],
        };
      }
      acc[courseKey].grades.push(grade);
      return acc;
    },
    {} as Record<
      string,
      {
        courseId: string | number;
        courseName: string;
        courseCode: string;
        grades: ApiGradeResponse[];
      }
    >
  );

  // Calculate average percentage
  const avgPercentage =
    rawGrades.length > 0
      ? rawGrades.reduce((sum, g) => sum + Number(g.percentage), 0) / rawGrades.length
      : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`p-6 rounded-[2.5rem] ${isDark ? 'bg-red-900/30 border border-red-700/30' : 'bg-red-50 border border-red-200'}`}
      >
        <p className={isDark ? 'text-red-300' : 'text-red-700'}>Error loading grades: {error}</p>
      </div>
    );
  }

  const exportGradesAsPDF = () => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Grades Transcript</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #1f2937; }
            h1 { margin-bottom: 8px; }
            .summary { display: flex; gap: 24px; margin: 16px 0 24px; }
            .summary span { font-size: 14px; }
            .summary strong { color: #4f46e5; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
            th { background: #4f46e5; color: white; padding: 10px 12px; text-align: left; font-size: 13px; }
            td { padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
            tr:nth-child(even) { background: #f9fafb; }
            .semester-title { font-size: 16px; font-weight: bold; margin: 20px 0 4px; }
            .semester-info { font-size: 13px; color: #6b7280; margin-bottom: 8px; }
            .footer { margin-top: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <h1>Grades Transcript</h1>
          <div class="summary">
            <span>Cumulative GPA: <strong>${cumulativeGPA}</strong></span>
            <span>Current Semester GPA: <strong>${currentSemesterGPA}</strong></span>
            <span>Total Credits: <strong>${totalCredits}</strong></span>
            <span>Class Rank: <strong>#${classRank}</strong></span>
          </div>
          ${semesters
            .map(
              (sem) => `
            <div class="semester-title">${sem.semester}</div>
            <div class="semester-info">GPA: ${sem.gpa} | Credits: ${sem.credits}</div>
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Course</th>
                  <th>Credits</th>
                  <th>%</th>
                  <th>Grade</th>
                  <th>Points</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${sem.courses
                  .map(
                    (c) =>
                      `<tr><td>${c.code}</td><td>${c.name}</td><td>${c.credits}</td><td>${c.percentage}%</td><td>${c.grade}</td><td>${c.points}</td><td>${c.status}</td></tr>`
                  )
                  .join('')}
              </tbody>
            </table>
          `
            )
            .join('')}
          <div class="footer">
            <p>Generated on: ${new Date().toLocaleString()}</p>
            <p>EduVerse Grades Transcript</p>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {t('gradesAndTranscript')}
          </h1>
          <p className={`text-slate-500 mt-1 font-medium`}>{t('academicRecord')}</p>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveView('grades')}
          className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
            activeView === 'grades'
              ? 'bg-blue-600 text-white'
              : isDark
                ? 'bg-white/5 text-slate-400 hover:bg-white/10'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Grades
        </button>
        <button
          onClick={() => setActiveView('analysis')}
          className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
            activeView === 'analysis'
              ? 'bg-blue-600 text-white'
              : isDark
                ? 'bg-white/5 text-slate-400 hover:bg-white/10'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Grade Analysis
        </button>
      </div>

      {activeView === 'grades' ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              label={t('cumulativeGPA')}
              value={cumulativeGPA.toFixed(2)}
              subtext={`${t('outOf')} 4.00`}
              icon={GraduationCap}
              color="violet"
              isDark={isDark}
            />
            <StatCard
              label={t('semesterGPA')}
              value={currentSemesterGPA.toFixed(2)}
              subtext={isRTL ? '+0.12 من الفصل السابق' : '+0.12 from last semester'}
              icon={TrendingUp}
              color="green"
              isDark={isDark}
            />
            <StatCard
              label="Average Grade"
              value={avgPercentage.toFixed(1) + '%'}
              subtext={`From ${rawGrades.length} grades`}
              icon={BookOpen}
              color="purple"
              isDark={isDark}
            />
            <StatCard
              label={t('rank')}
              value={classRank}
              subtext={isRTL ? 'من 450 طالب' : 'Out of 450 students'}
              icon={Award}
              color="orange"
              isDark={isDark}
            />
          </div>

          {/* Export as PDF */}
          <div className="flex justify-end">
            <button
              onClick={() => exportGradesAsPDF()}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isDark
                  ? 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/10'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <Download size={16} />
              <span className="text-sm font-medium">Export as PDF</span>
            </button>
          </div>

          {/* Grade Tables by Course */}
          {rawGrades.length > 0 ? (
            <div className="space-y-6">
              {Object.entries(gradesByCourse).map(([courseId, courseData]) => (
                <div
                  key={courseId}
                  className={`rounded-[2.5rem] overflow-hidden border shadow-sm ${
                    isDark
                      ? 'bg-card-dark border-white/15 shadow-black/25'
                      : 'glass !border-slate-300/95 shadow-slate-900/[0.06]'
                  }`}
                >
                  {/* Course Header — soft gradient from profile theme color */}
                  <div
                    className="relative overflow-hidden border-b px-5 py-5 md:px-6 md:py-6"
                    style={{
                      borderBottomColor: primaryAlpha(primaryHex, isDark ? 0.2 : 0.16),
                      background: isDark
                        ? `radial-gradient(ellipse 95% 80% at 100% -15%, ${primaryAlpha(primaryHex, 0.14)}, transparent 52%),
                           linear-gradient(155deg, ${primaryAlpha(primaryHex, 0.18)} 0%, ${primaryAlpha(primaryHex, 0.06)} 42%, rgba(15, 23, 42, 0.94) 100%)`
                        : `radial-gradient(ellipse 95% 75% at 100% -10%, ${primaryAlpha(primaryHex, 0.11)}, transparent 50%),
                           linear-gradient(155deg, ${primaryAlpha(primaryHex, 0.13)} 0%, ${primaryAlpha(primaryHex, 0.04)} 38%, rgba(255, 255, 255, 0.98) 100%)`,
                    }}
                  >
                    <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 items-center gap-4">
                        <div
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border shadow-sm"
                          style={{
                            borderColor: primaryAlpha(primaryHex, isDark ? 0.22 : 0.2),
                            backgroundColor: primaryAlpha(primaryHex, isDark ? 0.12 : 0.08),
                            color: primaryHex,
                          }}
                        >
                          <GraduationCap className="h-5 w-5" strokeWidth={1.5} />
                        </div>
                        <div className="min-w-0">
                          <span
                            className={`inline-block font-mono text-[10px] font-medium uppercase tracking-wider ${
                              isDark ? 'text-slate-400' : 'text-slate-500'
                            }`}
                          >
                            {courseData.courseCode}
                          </span>
                          <h3
                            className={`mt-1 text-lg font-semibold leading-snug tracking-tight md:text-xl ${
                              isDark ? 'text-white' : 'text-slate-900'
                            }`}
                          >
                            {courseData.courseName}
                          </h3>
                          <p
                            className={`mt-0.5 text-sm font-normal ${isDark ? 'text-slate-500' : 'text-slate-600'}`}
                          >
                            {courseData.grades.length} graded assessment
                            {courseData.grades.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>

                      <div
                        className="flex shrink-0 items-center sm:border-l sm:pl-5"
                        style={{ borderLeftColor: primaryAlpha(primaryHex, isDark ? 0.22 : 0.18) }}
                      >
                        <div className="text-left sm:text-right">
                          <p
                            className={`text-[10px] font-medium uppercase tracking-wide ${isDark ? 'text-slate-500' : 'text-slate-500'}`}
                          >
                            Course average
                          </p>
                          <div className="mt-0.5 flex items-baseline gap-0.5 sm:justify-end tabular-nums">
                            <span
                              className={`text-2xl font-semibold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}
                              style={{ color: primaryHex }}
                            >
                              {(
                                courseData.grades.reduce((acc, g) => acc + Number(g.percentage), 0) /
                                  courseData.grades.length || 0
                              ).toFixed(0)}
                            </span>
                            <span
                              className={`text-sm font-normal ${isDark ? 'text-slate-500' : 'text-slate-500'}`}
                            >
                              %
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Grades List */}
                  <div
                    className="divide-y"
                    style={{ borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#e5e7eb' }}
                  >
                    {courseData.grades.map((grade) => (
                      <div
                        key={String(grade.id)}
                        className={`px-4 py-3 transition-colors md:px-5 md:py-3.5 ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50/80'}`}
                      >
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
                          {/* Left: Item Info */}
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                                  getGradeTypeBadge(grade.gradeType, isDark).bg
                                } ${getGradeTypeBadge(grade.gradeType, isDark).text}`}
                              >
                                {grade.gradeType.charAt(0).toUpperCase() + grade.gradeType.slice(1)}
                              </span>
                              <h4
                                className={`text-sm font-medium leading-snug ${isDark ? 'text-white' : 'text-slate-800'}`}
                              >
                                {getItemTitle(grade)}
                              </h4>
                            </div>
                            {grade.feedback && (
                              <p
                                className={`mt-1 line-clamp-2 text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
                              >
                                {grade.feedback}
                              </p>
                            )}
                          </div>

                          {/* Right: Grade Info */}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 md:justify-end md:gap-x-5">
                            <div>
                              <p
                                className={`text-[10px] font-medium uppercase tracking-wide ${isDark ? 'text-slate-500' : 'text-slate-500'}`}
                              >
                                Score
                              </p>
                              <p
                                className={`text-sm font-medium tabular-nums ${isDark ? 'text-white' : 'text-slate-800'}`}
                              >
                                {Number(grade.score)}/{Number(grade.maxScore)}
                              </p>
                            </div>
                            <div>
                              <p
                                className={`text-[10px] font-medium uppercase tracking-wide ${isDark ? 'text-slate-500' : 'text-slate-500'}`}
                              >
                                %
                              </p>
                              <p
                                className={`text-sm font-medium tabular-nums ${isDark ? 'text-white' : 'text-slate-800'}`}
                              >
                                {Number(grade.percentage).toFixed(1)}%
                              </p>
                            </div>
                            <div>
                              <p
                                className={`text-[10px] font-medium uppercase tracking-wide ${isDark ? 'text-slate-500' : 'text-slate-500'}`}
                              >
                                Grade
                              </p>
                              <div
                                className={`mt-0.5 inline-block rounded px-2 py-0.5 text-xs font-medium border ${getGradeColor(grade.letterGrade, isDark).bg} ${getGradeColor(grade.letterGrade, isDark).text} ${getGradeColor(grade.letterGrade, isDark).border}`}
                              >
                                {grade.letterGrade}
                              </div>
                            </div>
                            {grade.isPublished ? (
                              <div
                                className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${isDark ? 'bg-green-900/50 text-green-400' : 'bg-green-50 text-green-700'}`}
                              >
                                Published
                              </div>
                            ) : (
                              <div
                                className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${isDark ? 'bg-yellow-900/50 text-yellow-400' : 'bg-yellow-50 text-yellow-700'}`}
                              >
                                Draft
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              className={`p-12 rounded-[2.5rem] text-center ${isDark ? 'bg-card-dark border border-white/5' : 'glass'}`}
            >
              <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>
                No grades available yet
              </p>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <button
              onClick={() => exportGradesAsPDF()}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isDark
                  ? 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/10'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <Download size={16} />
              <span className="text-sm font-medium">Export as PDF</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Target size={16} />
              <span className="text-sm font-medium">Set Study Goals</span>
            </button>
          </div>

          {/* Grade Analysis Component */}
          <GradeAnalysis />
        </>
      )}
    </div>
  );
}
