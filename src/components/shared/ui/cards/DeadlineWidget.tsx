import { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle, ChevronRight } from 'lucide-react';
import { cn } from '../../../../utils/cn';

interface Deadline {
  id: string;
  title: string;
  course: string;
  courseCode: string;
  dueDate: Date;
  type: 'assignment' | 'quiz' | 'exam' | 'project';
  completed?: boolean;
}

interface DeadlineWidgetProps {
  deadlines: Deadline[];
  onViewDeadline: (id: string) => void;
  onViewAll: () => void;
  className?: string;
}

const typeColors = {
  assignment: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  quiz: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  exam: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  project: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
};

function getTimeRemaining(dueDate: Date): { text: string; urgent: boolean; overdue: boolean } {
  const now = new Date();
  const diff = dueDate.getTime() - now.getTime();
  
  if (diff < 0) {
    return { text: 'Overdue', urgent: true, overdue: true };
  }
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  
  if (hours < 24) {
    return { text: `${hours}h left`, urgent: true, overdue: false };
  }
  
  if (days === 1) {
    return { text: 'Tomorrow', urgent: true, overdue: false };
  }
  
  if (days <= 3) {
    return { text: `${days} days left`, urgent: true, overdue: false };
  }
  
  if (days <= 7) {
    return { text: `${days} days left`, urgent: false, overdue: false };
  }
  
  return { text: dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), urgent: false, overdue: false };
}

export function DeadlineWidget({
  deadlines,
  onViewDeadline,
  onViewAll,
  className,
}: DeadlineWidgetProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update every minute for real-time countdowns
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Sort by due date and filter incomplete
  const sortedDeadlines = [...deadlines]
    .filter((d) => !d.completed)
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
    .slice(0, 5);

  const urgentCount = sortedDeadlines.filter((d) => {
    const { urgent } = getTimeRemaining(d.dueDate);
    return urgent;
  }).length;

  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700',
        'transition-all duration-300 hover:shadow-lg overflow-hidden',
        className
      )}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/30">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Upcoming Deadlines</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {sortedDeadlines.length} pending
              </p>
            </div>
          </div>
          {urgentCount > 0 && (
            <div className="flex items-center gap-1 px-3 py-1 bg-red-100 dark:bg-red-900/30 rounded-full">
              <AlertTriangle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
              <span className="text-xs font-semibold text-red-700 dark:text-red-300">
                {urgentCount} urgent
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Deadlines List */}
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {sortedDeadlines.length === 0 ? (
          <div className="p-8 text-center">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
            <p className="text-gray-900 dark:text-white font-medium">All caught up!</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">No upcoming deadlines</p>
          </div>
        ) : (
          sortedDeadlines.map((deadline) => {
            const { text, urgent, overdue } = getTimeRemaining(deadline.dueDate);
            
            return (
              <button
                key={deadline.id}
                onClick={() => onViewDeadline(deadline.id)}
                className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group text-left"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn('px-2 py-0.5 rounded text-xs font-medium', typeColors[deadline.type])}>
                      {deadline.type.charAt(0).toUpperCase() + deadline.type.slice(1)}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {deadline.courseCode}
                    </span>
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white truncate">
                    {deadline.title}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {deadline.course}
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium',
                    overdue
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                      : urgent
                        ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  )}>
                    {text}
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Footer */}
      {sortedDeadlines.length > 0 && (
        <button
          onClick={onViewAll}
          className="w-full p-4 text-center text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors border-t border-gray-100 dark:border-gray-700"
        >
          View all deadlines
        </button>
      )}
    </div>
  );
}

export default DeadlineWidget;
