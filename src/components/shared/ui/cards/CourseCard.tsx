import { ReactNode } from 'react';
import { Clock, Users, BookOpen, MoreVertical, Play, FileText, ChevronRight } from 'lucide-react';
import { cn } from '../../../../utils/cn';

interface CourseCardProps {
  id: string;
  code: string;
  name: string;
  instructor: string;
  schedule: string;
  room: string;
  progress: number;
  thumbnail?: string;
  color?: string;
  credits: number;
  students?: number;
  nextClass?: string;
  unreadAnnouncements?: number;
  pendingAssignments?: number;
  onView: () => void;
  onContinue?: () => void;
  onViewMaterials?: () => void;
  className?: string;
}

const defaultColors = [
  'from-indigo-500 to-purple-600',
  'from-blue-500 to-cyan-600',
  'from-emerald-500 to-teal-600',
  'from-orange-500 to-red-600',
  'from-pink-500 to-rose-600',
  'from-violet-500 to-purple-600',
];

export function CourseCard({
  id,
  code,
  name,
  instructor,
  schedule,
  room,
  progress,
  thumbnail,
  color,
  credits,
  students,
  nextClass,
  unreadAnnouncements = 0,
  pendingAssignments = 0,
  onView,
  onContinue,
  onViewMaterials,
  className,
}: CourseCardProps) {
  // Generate consistent color from course code if not provided
  const gradientColor = color || defaultColors[code.charCodeAt(0) % defaultColors.length];

  return (
    <div
      className={cn(
        'group bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700',
        'overflow-hidden transition-all duration-300',
        'hover:shadow-xl hover:-translate-y-1',
        className
      )}
    >
      {/* Header/Thumbnail */}
      <div className={cn('relative h-32 overflow-hidden', `bg-gradient-to-br ${gradientColor}`)}>
        {thumbnail && (
          <img
            src={thumbnail}
            alt={name}
            className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-30"
          />
        )}
        
        {/* Course Code Badge */}
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm font-semibold rounded-lg">
            {code}
          </span>
        </div>

        {/* Quick Actions */}
        <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {onContinue && (
            <button
              onClick={(e) => { e.stopPropagation(); onContinue(); }}
              className="p-2 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-colors"
              title="Continue Learning"
            >
              <Play className="w-4 h-4" />
            </button>
          )}
          {onViewMaterials && (
            <button
              onClick={(e) => { e.stopPropagation(); onViewMaterials(); }}
              className="p-2 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-colors"
              title="View Materials"
            >
              <FileText className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Badges */}
        <div className="absolute bottom-3 right-3 flex gap-2">
          {unreadAnnouncements > 0 && (
            <span className="px-2 py-0.5 bg-amber-500 text-white text-xs font-semibold rounded-full">
              {unreadAnnouncements} new
            </span>
          )}
          {pendingAssignments > 0 && (
            <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-semibold rounded-full">
              {pendingAssignments} due
            </span>
          )}
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
          <div
            className="h-full bg-white transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {name}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          {instructor}
        </p>

        {/* Info Row */}
        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-4">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{schedule}</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{credits} credits</span>
          </div>
          {students !== undefined && (
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              <span>{students}</span>
            </div>
          )}
        </div>

        {/* Next Class Info */}
        {nextClass && (
          <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg mb-4">
            <p className="text-xs text-indigo-600 dark:text-indigo-400">
              <span className="font-medium">Next class:</span> {nextClass}
            </p>
          </div>
        )}

        {/* Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-gray-500 dark:text-gray-400">Progress</span>
            <span className="font-medium text-gray-900 dark:text-white">{progress}%</span>
          </div>
          <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                progress >= 80 ? 'bg-green-500' : progress >= 50 ? 'bg-amber-500' : 'bg-indigo-500'
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* View Course Button */}
        <button
          onClick={onView}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium text-sm hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group/btn"
        >
          <span>View Course</span>
          <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}

export default CourseCard;
