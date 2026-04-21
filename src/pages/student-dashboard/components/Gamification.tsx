import { useState } from 'react';
import {
  Trophy,
  Medal,
  Star,
  Flame,
  Target,
  Award,
  Crown,
  Zap,
  TrendingUp,
  Users,
  Gift,
  Lock,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  progress: number;
  maxProgress: number;
  points: number;
  unlocked: boolean;
  category: 'academic' | 'engagement' | 'streak' | 'social';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  points: number;
  level: number;
  change: 'up' | 'down' | 'same';
  isCurrentUser?: boolean;
}

interface Badge {
  id: string;
  name: string;
  icon: React.ReactNode;
  earned: boolean;
  earnedDate?: string;
  description: string;
}

const achievements: Achievement[] = [];

const leaderboard: LeaderboardEntry[] = [];

const badges: Badge[] = [];

export function Gamification() {
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'leaderboard'>(
    'overview'
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const currentPoints = 0;
  const currentLevel = 1;
  const pointsToNextLevel = 1000;
  const streak = 0;

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'from-slate-400 to-slate-500';
      case 'rare':
        return 'from-blue-400 to-blue-600';
      case 'epic':
        return 'from-blue-400 to-blue-600';
      case 'legendary':
        return 'from-amber-400 to-orange-500';
      default:
        return 'from-slate-400 to-slate-500';
    }
  };

  const getRarityBg = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'bg-slate-50 border-slate-100';
      case 'rare':
        return 'bg-blue-50 border-blue-200';
      case 'epic':
        return 'bg-blue-50 border-blue-200';
      case 'legendary':
        return 'bg-amber-50 border-amber-200';
      default:
        return 'bg-slate-50 border-slate-100';
    }
  };

  const filteredAchievements =
    selectedCategory === 'all'
      ? achievements
      : achievements.filter((a) => a.category === selectedCategory);

  const unlockedAchievements = achievements.filter((a) => a.unlocked).length;
  const { t, isRTL } = useLanguage();
  const { isDark, primaryHex } = useTheme() as any;
  const accentColor = primaryHex || '#3b82f6';

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {t('gamificationAchievements')}
          </h1>
          <p className={`text-slate-500 mt-1 font-medium`}>
            {isRTL
              ? 'اكسب نقاط، افتح شارات، وتسلق لوحة المتصدرين!'
              : 'Earn points, unlock badges, and climb the leaderboard!'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="glass rounded-[2.5rem] flex gap-2 p-2">
        {[
          {
            id: 'overview',
            label: isRTL ? 'نظرة عامة' : 'Overview',
            icon: <Sparkles className="w-4 h-4" />,
          },
          { id: 'achievements', label: t('achievements'), icon: <Trophy className="w-4 h-4" /> },
          { id: 'leaderboard', label: t('leaderboard'), icon: <Medal className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-[var(--accent-color)] text-white shadow-md'
                : `${isDark ? 'text-slate-400 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-50'}`
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="text-center py-20">
          <Sparkles className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
          <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
            No Gamification Data
          </h3>
          <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>
            Start completing tasks and assignments to earn points and badges!
          </p>
        </div>
      )}

      {/* Achievements Tab */}
      {activeTab === 'achievements' && (
        <div className="text-center py-20">
          <Trophy className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
          <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
            No Achievements Yet
          </h3>
          <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>
            Achievements you unlock will appear here.
          </p>
        </div>
      )}

      {/* Leaderboard Tab */}
      {activeTab === 'leaderboard' && (
        <div className="text-center py-20">
          <Medal className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
          <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
            No Leaderboard Data
          </h3>
          <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>
            The leaderboard will be populated once students start earning points.
          </p>
        </div>
      )}
    </div>
  );
}

export default Gamification;
