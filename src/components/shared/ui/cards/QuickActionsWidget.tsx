import { ReactNode } from 'react';
import { ArrowRight, BookOpen, FileText, Calendar, Play, Clock } from 'lucide-react';
import { cn } from '../../../../utils/cn';

interface QuickAction {
  id: string;
  title: string;
  subtitle: string;
  icon: ReactNode;
  color: string;
  progress?: number;
  deadline?: string;
  onClick: () => void;
}

interface QuickActionsWidgetProps {
  actions: QuickAction[];
  title?: string;
  className?: string;
}

export function QuickActionsWidget({
  actions,
  title = 'Quick Actions',
  className,
}: QuickActionsWidgetProps) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6',
        'transition-all duration-300',
        className
      )}
    >
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      
      <div className="space-y-3">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={action.onClick}
            className={cn(
              'w-full flex items-center gap-4 p-4 rounded-xl',
              'bg-gray-50 dark:bg-gray-700/50',
              'hover:bg-gray-100 dark:hover:bg-gray-700',
              'transition-all duration-200 group',
              'text-left'
            )}
          >
            <div className={cn('p-3 rounded-xl', action.color)}>
              {action.icon}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="font-medium text-gray-900 dark:text-white truncate">
                  {action.title}
                </p>
                {action.deadline && (
                  <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                    <Clock className="w-3 h-3" />
                    {action.deadline}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {action.subtitle}
              </p>
              
              {action.progress !== undefined && (
                <div className="mt-2">
                  <div className="h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${action.progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
            
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
          </button>
        ))}
      </div>
    </div>
  );
}

// Pre-built quick actions for student dashboard
export function StudentQuickActions({
  onContinueLearning,
  onNextAssignment,
  onUpcomingClass,
  onViewGrades,
  continueCourse,
  nextAssignment,
  upcomingClass,
  className,
}: {
  onContinueLearning: () => void;
  onNextAssignment: () => void;
  onUpcomingClass: () => void;
  onViewGrades: () => void;
  continueCourse?: { name: string; progress: number };
  nextAssignment?: { title: string; course: string; deadline: string };
  upcomingClass?: { name: string; time: string; room: string };
  className?: string;
}) {
  const actions: QuickAction[] = [];

  if (continueCourse) {
    actions.push({
      id: 'continue',
      title: 'Continue Learning',
      subtitle: continueCourse.name,
      icon: <Play className="w-5 h-5 text-white" />,
      color: 'bg-gradient-to-br from-indigo-500 to-purple-600',
      progress: continueCourse.progress,
      onClick: onContinueLearning,
    });
  }

  if (nextAssignment) {
    actions.push({
      id: 'assignment',
      title: 'Next Assignment',
      subtitle: `${nextAssignment.course} - ${nextAssignment.title}`,
      icon: <FileText className="w-5 h-5 text-white" />,
      color: 'bg-gradient-to-br from-amber-500 to-orange-600',
      deadline: nextAssignment.deadline,
      onClick: onNextAssignment,
    });
  }

  if (upcomingClass) {
    actions.push({
      id: 'class',
      title: 'Upcoming Class',
      subtitle: `${upcomingClass.name} • ${upcomingClass.room}`,
      icon: <Calendar className="w-5 h-5 text-white" />,
      color: 'bg-gradient-to-br from-green-500 to-emerald-600',
      deadline: upcomingClass.time,
      onClick: onUpcomingClass,
    });
  }

  actions.push({
    id: 'grades',
    title: 'View Grades',
    subtitle: 'Check your academic performance',
    icon: <BookOpen className="w-5 h-5 text-white" />,
    color: 'bg-gradient-to-br from-blue-500 to-cyan-600',
    onClick: onViewGrades,
  });

  return <QuickActionsWidget actions={actions} className={className} />;
}

export default QuickActionsWidget;
