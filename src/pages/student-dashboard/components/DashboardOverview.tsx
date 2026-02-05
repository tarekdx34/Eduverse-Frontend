import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  BookOpen,
  Clock,
  Target,
  Award,
  Calendar,
  FileText,
  Play,
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

// Import shared UI components
import { 
  StudyStreak, 
  DeadlineWidget,
  StudentQuickActions,
  CourseCard,
} from '../../../components/shared/ui/cards';
import { StatsCard } from '../../../components/shared/ui/cards/StatsCard';
import { WelcomeHeader } from '../../../components/shared/ui/layout/WelcomeHeader';
import { PageTransition, FadeIn } from '../../../components/shared/ui/layout/PageTransition';

interface DashboardOverviewProps {
  onNavigate: (tab: string) => void;
  onViewCourse: (courseId: string) => void;
}

// Mock data - in real app, this would come from API
const mockDeadlines = [
  {
    id: '1',
    title: 'Data Structures Assignment #3',
    course: 'Data Structures & Algorithms',
    courseCode: 'CS201',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
    type: 'assignment' as const,
  },
  {
    id: '2',
    title: 'Midterm Exam',
    course: 'Introduction to Computer Science',
    courseCode: 'CS101',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
    type: 'exam' as const,
  },
  {
    id: '3',
    title: 'JavaScript Quiz',
    course: 'Web Development Fundamentals',
    courseCode: 'CS150',
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day
    type: 'quiz' as const,
  },
  {
    id: '4',
    title: 'Database Design Project',
    course: 'Database Management Systems',
    courseCode: 'CS220',
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
    type: 'project' as const,
  },
];

const mockRecentCourses = [
  {
    id: '1',
    code: 'CS201',
    name: 'Data Structures & Algorithms',
    instructor: 'Prof. Michael Chen',
    schedule: 'Tue, Thu - 10:00 AM',
    room: 'Lab 401',
    progress: 60,
    credits: 4,
    students: 38,
    nextClass: 'Tomorrow, 10:00 AM',
    pendingAssignments: 2,
  },
  {
    id: '2',
    code: 'CS101',
    name: 'Introduction to Computer Science',
    instructor: 'Dr. Sarah Johnson',
    schedule: 'Mon, Wed, Fri - 08:30 AM',
    room: 'Room 301',
    progress: 75,
    credits: 3,
    students: 45,
    nextClass: 'Monday, 08:30 AM',
    unreadAnnouncements: 1,
  },
  {
    id: '3',
    code: 'CS150',
    name: 'Web Development Fundamentals',
    instructor: 'Dr. Emily Roberts',
    schedule: 'Mon, Wed - 02:00 PM',
    room: 'Lab 302',
    progress: 85,
    credits: 3,
    students: 42,
  },
];

export default function DashboardOverview({ onNavigate, onViewCourse }: DashboardOverviewProps) {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Mock study streak data
  const streakData = {
    currentStreak: 12,
    longestStreak: 21,
    weeklyActivity: [true, true, true, false, true, true, false], // Mon-Sun
    todayCompleted: true,
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <FadeIn direction="down" delay={0}>
        <WelcomeHeader
          greeting="Welcome back"
          userName="Tarek"
          subtitle="You have"
          highlightText="3 deadlines coming up this week. Keep up the great work!"
          role="student"
          actions={
            <button
              onClick={() => onNavigate('ai')}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors"
            >
              <Play className="w-4 h-4" />
              AI Study Assistant
            </button>
          }
        />
      </FadeIn>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <FadeIn delay={100}>
          <StatsCard
            title="Credits Completed"
            value={120}
            subtitle="of 144 total"
            icon={<Target className="w-5 h-5" />}
            trend={{ value: 24, label: 'this semester', isPositive: true }}
            progress={{ current: 120, max: 144 }}
            color="indigo"
          />
        </FadeIn>
        <FadeIn delay={150}>
          <StatsCard
            title="Current GPA"
            value={3.75}
            subtitle="out of 4.0"
            icon={<Award className="w-5 h-5" />}
            trend={{ value: 0.15, label: 'vs last semester', isPositive: true }}
            color="green"
          />
        </FadeIn>
        <FadeIn delay={200}>
          <StatsCard
            title="Active Courses"
            value={6}
            subtitle="this semester"
            icon={<BookOpen className="w-5 h-5" />}
            color="purple"
          />
        </FadeIn>
        <FadeIn delay={250}>
          <StatsCard
            title="Attendance Rate"
            value={94}
            valueSuffix="%"
            subtitle="above average"
            icon={<Clock className="w-5 h-5" />}
            trend={{ value: 2, label: 'improvement', isPositive: true }}
            color="cyan"
          />
        </FadeIn>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Quick Actions & Deadlines */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <StudentQuickActions
            continueCourse={{ name: 'Data Structures & Algorithms', progress: 60 }}
            nextAssignment={{ title: 'Assignment #3', course: 'CS201', deadline: '2 days' }}
            upcomingClass={{ name: 'Web Development', time: 'Today 2:00 PM', room: 'Lab 302' }}
            onContinueLearning={() => onViewCourse('2')}
            onNextAssignment={() => onNavigate('assignments')}
            onUpcomingClass={() => onNavigate('schedule')}
            onViewGrades={() => onNavigate('grades')}
          />

          {/* Recent Courses */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Recent Courses
              </h2>
              <button
                onClick={() => onNavigate('myclass')}
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                View all
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {mockRecentCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  id={course.id}
                  code={course.code}
                  name={course.name}
                  instructor={course.instructor}
                  schedule={course.schedule}
                  room={course.room}
                  progress={course.progress}
                  credits={course.credits}
                  students={course.students}
                  nextClass={course.nextClass}
                  unreadAnnouncements={course.unreadAnnouncements}
                  pendingAssignments={course.pendingAssignments}
                  onView={() => onViewCourse(course.id)}
                  onContinue={() => onViewCourse(course.id)}
                  onViewMaterials={() => onViewCourse(course.id)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Study Streak & Deadlines */}
        <div className="space-y-6">
          {/* Study Streak */}
          <StudyStreak
            currentStreak={streakData.currentStreak}
            longestStreak={streakData.longestStreak}
            weeklyActivity={streakData.weeklyActivity}
            todayCompleted={streakData.todayCompleted}
          />

          {/* Upcoming Deadlines */}
          <DeadlineWidget
            deadlines={mockDeadlines}
            onViewDeadline={(id) => onNavigate('assignments')}
            onViewAll={() => onNavigate('assignments')}
          />
        </div>
      </div>
    </div>
  );
}
