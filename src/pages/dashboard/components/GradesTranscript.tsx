import { Download, Filter, Search } from 'lucide-react';
import { useState } from 'react';

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

const getGradeColor = (grade: string) => {
  if (grade.startsWith('A')) return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' };
  if (grade.startsWith('B')) return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
  if (grade.startsWith('C')) return { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' };
  return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' };
};

const getStatusColor = (status: string) => {
  return status === 'Completed'
    ? 'bg-green-50 text-green-700'
    : 'bg-yellow-50 text-yellow-700';
};

const StatCard = ({
  label,
  value,
  subtext,
  color,
}: {
  label: string;
  value: string | number;
  subtext: string;
  color: string;
}) => (
  <div className="bg-white border border-gray-200 rounded-lg p-6 flex justify-between items-start gap-4">
    <div className="flex-1">
      <p className="text-sm text-gray-600 mb-2">{label}</p>
      <p className="text-3xl font-semibold text-gray-900 mb-3">{value}</p>
      <p className="text-sm text-gray-500">{subtext}</p>
    </div>
    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
  </div>
);

const GradeTable = ({ semester, courses }: { semester: SemesterData }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCourses] = useState(courses);

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{semester.semester}</h3>
            <p className="text-sm text-gray-600 mt-1">
              GPA: {semester.gpa} | Credits: {semester.credits}
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Download size={16} />
            <span className="text-sm font-medium text-gray-700">Export</span>
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter size={16} />
            <span className="text-sm font-medium text-gray-700">Filter</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            <Download size={16} />
            <span className="text-sm font-medium">Download</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-600">Course Code</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-600">Course Name</th>
              <th className="px-6 py-4 text-center text-sm font-bold text-gray-600">Credits</th>
              <th className="px-6 py-4 text-center text-sm font-bold text-gray-600">Percentage</th>
              <th className="px-6 py-4 text-center text-sm font-bold text-gray-600">Grade</th>
              <th className="px-6 py-4 text-center text-sm font-bold text-gray-600">Points</th>
              <th className="px-6 py-4 text-center text-sm font-bold text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredCourses.map((course) => {
              const gradeColor = getGradeColor(course.grade);
              return (
                <tr key={course.code} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-5 text-sm font-medium text-gray-900">{course.code}</td>
                  <td className="px-6 py-5 text-sm text-gray-900">{course.name}</td>
                  <td className="px-6 py-5 text-sm text-gray-600 text-center">{course.credits}</td>
                  <td className="px-6 py-5 text-sm text-gray-900 text-center">{course.percentage}%</td>
                  <td className="px-6 py-5 text-center">
                    <div className={`inline-block px-3 py-1 rounded ${gradeColor.bg} ${gradeColor.text} text-sm font-medium border ${gradeColor.border}`}>
                      {course.grade}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm font-medium text-gray-900 text-center">{course.points}</td>
                  <td className="px-6 py-5 text-center">
                    <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${getStatusColor(course.status)}`}>
                      {course.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
          {/* Footer Summary */}
          <tfoot>
            <tr className="bg-gray-50 border-t border-gray-200">
              <td colSpan={2} className="px-6 py-4 text-sm font-medium text-gray-900">
                Total
              </td>
              <td className="px-6 py-4 text-center text-sm font-medium text-gray-900">
                {filteredCourses.reduce((sum, c) => sum + c.credits, 0)} Credits
              </td>
              <td />
              <td />
              <td className="px-6 py-4 text-center text-sm font-medium text-gray-900">
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
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Cumulative GPA"
          value={cumulativeGPA}
          subtext="Out of 4.00"
          color="bg-indigo-100"
        />
        <StatCard
          label="Current Semester GPA"
          value={currentSemesterGPA}
          subtext="+0.12 from last semester"
          color="bg-green-100"
        />
        <StatCard
          label="Total Credits Earned"
          value={totalCredits}
          subtext="Out of 144 required"
          color="bg-purple-100"
        />
        <StatCard
          label="Class Rank"
          value={classRank}
          subtext="Out of 450 students"
          color="bg-orange-100"
        />
      </div>

      {/* Grade Tables by Semester */}
      <div className="space-y-6">
        {semesters.map((semester) => (
          <GradeTable key={semester.semester} semester={semester} courses={semester.courses} />
        ))}
      </div>
    </div>
  );
}
