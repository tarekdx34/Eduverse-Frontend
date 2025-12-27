import React from 'react';
import { CheckCircle, Clock, FileText, Calendar } from 'lucide-react';

type Activity = {
  id: number;
  type: 'grade' | 'assignment' | 'attendance';
  title: string;
  description: string;
  time: string;
};

type ActivityFeedProps = {
  activities: Activity[];
};

const ACTIVITY_CONFIG = {
  grade: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  assignment: {
    icon: FileText,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  attendance: {
    icon: Calendar,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
};

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
          <Clock size={20} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {activities.map((activity, index) => {
          const config = ACTIVITY_CONFIG[activity.type];
          const Icon = config.icon;

          return (
            <div key={activity.id} className="relative">
              {/* Timeline line */}
              {index < activities.length - 1 && (
                <div className="absolute left-5 top-12 bottom-0 w-px bg-gray-200" />
              )}

              <div className="flex gap-4">
                {/* Icon */}
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full ${config.bgColor} ${config.color} flex items-center justify-center relative z-10`}
                >
                  <Icon size={18} />
                </div>

                {/* Content */}
                <div className="flex-1 pb-4">
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="font-medium text-gray-900">{activity.title}</h4>
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                      {activity.time}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{activity.description}</p>
                </div>
              </div>
            </div>
          );
        })}

        {activities.length === 0 && (
          <div className="text-center py-8 text-gray-500">No recent activity</div>
        )}
      </div>
    </div>
  );
}

export default ActivityFeed;
