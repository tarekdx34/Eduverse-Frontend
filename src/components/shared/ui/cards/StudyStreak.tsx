import { useState, useEffect } from 'react';
import { Flame, Calendar, Target, Trophy, Sparkles } from 'lucide-react';
import { cn } from '../../../../utils/cn';

interface StudyStreakProps {
  currentStreak: number;
  longestStreak: number;
  weeklyActivity: boolean[]; // Array of 7 booleans for Mon-Sun
  todayCompleted: boolean;
  className?: string;
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function StudyStreak({
  currentStreak,
  longestStreak,
  weeklyActivity,
  todayCompleted,
  className,
}: StudyStreakProps) {
  const [animateFlame, setAnimateFlame] = useState(false);

  useEffect(() => {
    if (currentStreak > 0) {
      setAnimateFlame(true);
      const timer = setTimeout(() => setAnimateFlame(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [currentStreak]);

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return 'from-orange-500 to-red-500';
    if (streak >= 14) return 'from-amber-500 to-orange-500';
    if (streak >= 7) return 'from-yellow-500 to-amber-500';
    return 'from-blue-500 to-indigo-500';
  };

  const streakGradient = getStreakColor(currentStreak);

  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6',
        'transition-all duration-300 hover:shadow-lg',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center',
            `bg-gradient-to-br ${streakGradient}`
          )}>
            <Flame className={cn(
              'w-6 h-6 text-white',
              animateFlame && 'animate-bounce'
            )} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Study Streak</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Keep the momentum!</p>
          </div>
        </div>
        {currentStreak >= 7 && (
          <div className="flex items-center gap-1 px-3 py-1 bg-amber-100 dark:bg-amber-900/30 rounded-full">
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">On Fire!</span>
          </div>
        )}
      </div>

      {/* Current Streak */}
      <div className="text-center mb-6">
        <div className="relative inline-block">
          <span className={cn(
            'text-6xl font-bold bg-clip-text text-transparent',
            `bg-gradient-to-r ${streakGradient}`
          )}>
            {currentStreak}
          </span>
          <span className="absolute -top-2 -right-4 text-2xl">🔥</span>
        </div>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {currentStreak === 1 ? 'day' : 'days'} in a row
        </p>
      </div>

      {/* Weekly Activity */}
      <div className="mb-6">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">
          This Week
        </p>
        <div className="flex justify-between gap-2">
          {WEEKDAYS.map((day, index) => {
            const isActive = weeklyActivity[index];
            const isToday = index === new Date().getDay() - 1 || (index === 6 && new Date().getDay() === 0);
            
            return (
              <div key={day} className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    'w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300',
                    isActive
                      ? `bg-gradient-to-br ${streakGradient} text-white shadow-md`
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500',
                    isToday && !isActive && 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-gray-800'
                  )}
                >
                  {isActive ? (
                    <Flame className="w-4 h-4" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-current" />
                  )}
                </div>
                <span className={cn(
                  'text-xs font-medium',
                  isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'
                )}>
                  {day}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
            <Trophy className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{longestStreak}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Best streak</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
            <Target className="w-4 h-4 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {todayCompleted ? '✓' : '—'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Today</p>
          </div>
        </div>
      </div>

      {/* Motivation Message */}
      {!todayCompleted && (
        <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
          <p className="text-sm text-indigo-700 dark:text-indigo-300 text-center">
            Complete today's study goal to keep your streak alive! 💪
          </p>
        </div>
      )}
    </div>
  );
}

export default StudyStreak;
