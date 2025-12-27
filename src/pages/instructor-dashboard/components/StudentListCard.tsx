import React from 'react';
import { Award, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';

type Student = {
  id: number;
  name: string;
  grade: string;
  average: number;
  trend: 'up' | 'down' | 'stable';
};

type StudentListCardProps = {
  title: string;
  students: Student[];
  type: 'top' | 'risk';
};

export function StudentListCard({ title, students, type }: StudentListCardProps) {
  const isTopPerformers = type === 'top';

  return (
    <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div
          className={`p-2 rounded-lg ${isTopPerformers ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}
        >
          {isTopPerformers ? <Award size={20} /> : <AlertTriangle size={20} />}
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>

      <div className="space-y-3">
        {students.map((student, index) => (
          <div
            key={student.id}
            className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              {/* Rank badge */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  isTopPerformers
                    ? index === 0
                      ? 'bg-yellow-400 text-yellow-900'
                      : 'bg-gray-200 text-gray-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {index + 1}
              </div>

              {/* Student info */}
              <div>
                <div className="font-medium text-gray-900">{student.name}</div>
                <div className="text-xs text-gray-500">Average: {student.average}%</div>
              </div>
            </div>

            {/* Grade and trend */}
            <div className="flex items-center gap-3">
              <div
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  isTopPerformers ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}
              >
                {student.grade}
              </div>

              {student.trend === 'up' && <TrendingUp size={16} className="text-green-600" />}
              {student.trend === 'down' && <TrendingDown size={16} className="text-red-600" />}
            </div>
          </div>
        ))}

        {students.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {isTopPerformers ? 'No top performers yet' : 'No at-risk students'}
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentListCard;
