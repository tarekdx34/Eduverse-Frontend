import {
  Download,
  Filter,
  Search,
  Target,
  GraduationCap,
  TrendingUp,
  BookOpen,
  Award,
} from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { GradeAnalysis } from './GradeAnalysis';

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

export default function GradesTranscript({
  cumulativeGPA = 3.75,
  currentSemesterGPA = 3.62,
  totalCredits = 120,
  classRank = 15,
  semesters = defaultSemesters,
}: GradesTranscriptProps) {
  const { t, isRTL } = useLanguage();
  const { isDark } = useTheme();
  const [activeView, setActiveView] = useState<'grades' | 'analysis'>('grades');

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
              value={cumulativeGPA}
              subtext={`${t('outOf')} 4.00`}
              icon={GraduationCap}
              color="violet"
              isDark={isDark}
            />
            <StatCard
              label={t('semesterGPA')}
              value={currentSemesterGPA}
              subtext={isRTL ? '+0.12 من الفصل السابق' : '+0.12 from last semester'}
              icon={TrendingUp}
              color="green"
              isDark={isDark}
            />
            <StatCard
              label={t('creditHours')}
              value={totalCredits}
              subtext={isRTL ? 'من 144 مطلوبة' : 'Out of 144 required'}
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
              onClick={() => window.print()}
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

          {/* Grade Tables by Semester */}
          <div className="space-y-6">
            {semesters.map((semester) => (
              <GradeTable
                key={semester.semester}
                semester={semester}
                courses={semester.courses}
                isDark={isDark}
              />
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <button
              onClick={() => window.print()}
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
