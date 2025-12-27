import React, { useState } from 'react';
import {
  Download,
  FileText,
  Image as ImageIcon,
  TrendingUp,
  Users,
  Award,
  Target,
} from 'lucide-react';
import { MetricCard } from './MetricCard';
import { PerformanceChart } from './PerformanceChart';
import { TrendChart } from './TrendChart';
import { StudentListCard } from './StudentListCard';
import { ActivityFeed } from './ActivityFeed';

export type GradeDistribution = Record<string, number>;
export type EnrollmentTrendPoint = { month: string; count: number };

type ReportsAnalyticsProps = {
  gradeDistribution: GradeDistribution;
  enrollmentTrend: EnrollmentTrendPoint[];
};

export function ReportsAnalytics({ gradeDistribution, enrollmentTrend }: ReportsAnalyticsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'engagement'>('overview');

  // Calculate metrics
  const totalStudents = Object.values(gradeDistribution).reduce((sum, count) => sum + count, 0);
  const averageGrade = calculateAverageGrade(gradeDistribution);
  const attendanceRate = 87.5; // Mock data
  const assignmentsGraded = 156; // Mock data

  // Mock data for student lists
  const topPerformers = [
    { id: 1, name: 'Alice Johnson', grade: 'A', average: 96, trend: 'up' as const },
    { id: 2, name: 'Noah Williams', grade: 'A', average: 94, trend: 'stable' as const },
    { id: 3, name: 'Olivia Brown', grade: 'A-', average: 92, trend: 'up' as const },
    { id: 4, name: 'Liam Garcia', grade: 'A-', average: 91, trend: 'down' as const },
    { id: 5, name: 'Emma Martinez', grade: 'B+', average: 89, trend: 'up' as const },
  ];

  const atRiskStudents = [
    { id: 101, name: 'Jackson Lee', grade: 'C-', average: 68, trend: 'down' as const },
    { id: 102, name: 'Sophia Davis', grade: 'C', average: 72, trend: 'down' as const },
    { id: 103, name: 'Mason Rodriguez', grade: 'C+', average: 75, trend: 'stable' as const },
  ];

  // Mock activity data
  const recentActivities = [
    {
      id: 1,
      type: 'grade' as const,
      title: 'Quiz 2 Graded',
      description: '98 submissions graded for CS101',
      time: '2 hours ago',
    },
    {
      id: 2,
      type: 'assignment' as const,
      title: 'HW2 Submitted',
      description: '95 students submitted HW2: Arrays',
      time: '5 hours ago',
    },
    {
      id: 3,
      type: 'attendance' as const,
      title: 'Attendance Recorded',
      description: 'CS202 - Section B: 96/100 present',
      time: '1 day ago',
    },
    {
      id: 4,
      type: 'grade' as const,
      title: 'Midterm Graded',
      description: 'CS303 midterm completed',
      time: '2 days ago',
    },
    {
      id: 5,
      type: 'assignment' as const,
      title: 'New Assignment Posted',
      description: 'Quiz 3: Functions posted to CS101',
      time: '3 days ago',
    },
  ];

  const handleExport = (format: 'pdf' | 'csv' | 'png') => {
    // Mock export functionality
    console.log(`Exporting as ${format.toUpperCase()}...`);
    alert(`Export as ${format.toUpperCase()} - Feature coming soon!`);
  };

  return (
    <div className="space-y-6">
      {/* Header with Export Options */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
          <p className="text-sm text-gray-500 mt-1">
            Comprehensive insights into student performance and engagement
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('csv')}
            className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FileText size={16} />
            CSV
          </button>
          <button
            onClick={() => handleExport('png')}
            className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ImageIcon size={16} />
            PNG
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Download size={16} />
            Export PDF
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <div className="flex gap-6">
          {[
            { key: 'overview' as const, label: 'Overview' },
            { key: 'performance' as const, label: 'Performance' },
            { key: 'engagement' as const, label: 'Engagement' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
                activeTab === tab.key ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Average Performance"
              value={`${averageGrade}%`}
              icon={<TrendingUp size={24} />}
              trend={{ value: '+3.2%', isPositive: true }}
              gradient="from-green-500 to-emerald-600"
            />
            <MetricCard
              title="Total Students"
              value={totalStudents}
              icon={<Users size={24} />}
              trend={{ value: '+5', isPositive: true }}
              gradient="from-blue-500 to-cyan-600"
            />
            <MetricCard
              title="Assignments Graded"
              value={assignmentsGraded}
              icon={<Award size={24} />}
              gradient="from-purple-500 to-pink-600"
            />
            <MetricCard
              title="Attendance Rate"
              value={`${attendanceRate}%`}
              icon={<Target size={24} />}
              trend={{ value: '+1.5%', isPositive: true }}
              gradient="from-amber-500 to-orange-600"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PerformanceChart data={gradeDistribution} />
            <TrendChart data={enrollmentTrend} title="Enrollment Trend" color="#6366f1" />
          </div>

          {/* Student Lists and Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <StudentListCard title="Top Performers" students={topPerformers} type="top" />
            <StudentListCard title="At-Risk Students" students={atRiskStudents} type="risk" />
            <ActivityFeed activities={recentActivities} />
          </div>
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PerformanceChart data={gradeDistribution} />

            {/* Assignment Performance */}
            <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Assignment Performance</h3>
              <div className="space-y-4">
                {[
                  { name: 'Quiz 1: Variables & IO', completion: 98, avgScore: 87 },
                  { name: 'Quiz 2: Control Flow', completion: 97, avgScore: 84 },
                  { name: 'HW1: Basics', completion: 95, avgScore: 91 },
                  { name: 'HW2: Arrays', completion: 85, avgScore: 78 },
                  { name: 'Midterm', completion: 100, avgScore: 82 },
                ].map((assignment) => (
                  <div key={assignment.name}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">{assignment.name}</span>
                      <span className="text-sm text-gray-500">{assignment.avgScore}% avg</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          assignment.completion >= 90
                            ? 'bg-green-500'
                            : assignment.completion >= 70
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                        }`}
                        style={{ width: `${assignment.completion}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {assignment.completion}% completion
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StudentListCard title="Top Performers" students={topPerformers} type="top" />
            <StudentListCard title="At-Risk Students" students={atRiskStudents} type="risk" />
          </div>
        </div>
      )}

      {/* Engagement Tab */}
      {activeTab === 'engagement' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TrendChart
              data={enrollmentTrend}
              title="Student Engagement Over Time"
              color="#8b5cf6"
            />

            {/* Attendance by Section */}
            <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Attendance by Section</h3>
              <div className="space-y-4">
                {[
                  { section: 'CS101 - Section A', present: 116, total: 120, rate: 96.7 },
                  { section: 'CS202 - Section B', present: 95, total: 100, rate: 95.0 },
                  { section: 'CS303 - Section C', present: 84, total: 90, rate: 93.3 },
                ].map((section) => (
                  <div key={section.section}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">{section.section}</span>
                      <span className="text-sm text-gray-500">{section.rate}%</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          section.rate >= 90
                            ? 'bg-green-500'
                            : section.rate >= 75
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                        }`}
                        style={{ width: `${section.rate}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {section.present}/{section.total} students present
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <ActivityFeed activities={recentActivities} />
        </div>
      )}
    </div>
  );
}

function calculateAverageGrade(distribution: GradeDistribution): number {
  const gradePoints: Record<string, number> = {
    A: 95,
    'A-': 92,
    'B+': 88,
    B: 85,
    'B-': 82,
    'C+': 78,
    C: 75,
    'C-': 72,
    D: 65,
    F: 50,
  };

  let totalPoints = 0;
  let totalStudents = 0;

  Object.entries(distribution).forEach(([grade, count]) => {
    totalPoints += (gradePoints[grade] || 0) * count;
    totalStudents += count;
  });

  return totalStudents > 0 ? Math.round(totalPoints / totalStudents) : 0;
}

export default ReportsAnalytics;
