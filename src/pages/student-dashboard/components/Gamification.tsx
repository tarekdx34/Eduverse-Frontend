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
  Sparkles
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

const achievements: Achievement[] = [
  {
    id: '1',
    title: 'First Steps',
    description: 'Complete your first assignment',
    icon: <Target className="w-6 h-6" />,
    progress: 1,
    maxProgress: 1,
    points: 50,
    unlocked: true,
    category: 'academic',
    rarity: 'common'
  },
  {
    id: '2',
    title: 'Knowledge Seeker',
    description: 'Complete 10 assignments',
    icon: <Award className="w-6 h-6" />,
    progress: 7,
    maxProgress: 10,
    points: 200,
    unlocked: false,
    category: 'academic',
    rarity: 'rare'
  },
  {
    id: '3',
    title: 'Perfect Score',
    description: 'Get 100% on any assignment',
    icon: <Star className="w-6 h-6" />,
    progress: 1,
    maxProgress: 1,
    points: 150,
    unlocked: true,
    category: 'academic',
    rarity: 'rare'
  },
  {
    id: '4',
    title: 'On Fire',
    description: 'Maintain a 7-day study streak',
    icon: <Flame className="w-6 h-6" />,
    progress: 5,
    maxProgress: 7,
    points: 300,
    unlocked: false,
    category: 'streak',
    rarity: 'epic'
  },
  {
    id: '5',
    title: 'Quiz Master',
    description: 'Complete 20 AI-generated quizzes',
    icon: <Zap className="w-6 h-6" />,
    progress: 12,
    maxProgress: 20,
    points: 250,
    unlocked: false,
    category: 'engagement',
    rarity: 'rare'
  },
  {
    id: '6',
    title: 'Social Butterfly',
    description: 'Help 5 classmates with questions',
    icon: <Users className="w-6 h-6" />,
    progress: 3,
    maxProgress: 5,
    points: 200,
    unlocked: false,
    category: 'social',
    rarity: 'rare'
  },
  {
    id: '7',
    title: 'Dean\'s List',
    description: 'Achieve GPA above 3.7',
    icon: <Crown className="w-6 h-6" />,
    progress: 1,
    maxProgress: 1,
    points: 500,
    unlocked: true,
    category: 'academic',
    rarity: 'legendary'
  },
  {
    id: '8',
    title: 'Early Bird',
    description: 'Submit 5 assignments before deadline',
    icon: <Sparkles className="w-6 h-6" />,
    progress: 3,
    maxProgress: 5,
    points: 150,
    unlocked: false,
    category: 'engagement',
    rarity: 'common'
  }
];

const leaderboard: LeaderboardEntry[] = [
  { rank: 1, name: 'Ahmed Hassan', avatar: 'AH', points: 4850, level: 12, change: 'same' },
  { rank: 2, name: 'Sarah Chen', avatar: 'SC', points: 4720, level: 11, change: 'up' },
  { rank: 3, name: 'Mohamed Ali', avatar: 'MA', points: 4580, level: 11, change: 'down' },
  { rank: 4, name: 'Emma Wilson', avatar: 'EW', points: 4350, level: 10, change: 'up' },
  { rank: 5, name: 'Tarek Mohamed', avatar: 'TM', points: 4200, level: 10, change: 'up', isCurrentUser: true },
  { rank: 6, name: 'Lisa Anderson', avatar: 'LA', points: 4050, level: 9, change: 'down' },
  { rank: 7, name: 'James Wilson', avatar: 'JW', points: 3920, level: 9, change: 'same' },
  { rank: 8, name: 'Nour Ahmed', avatar: 'NA', points: 3800, level: 9, change: 'up' },
  { rank: 9, name: 'David Kim', avatar: 'DK', points: 3650, level: 8, change: 'down' },
  { rank: 10, name: 'Fatima Hassan', avatar: 'FH', points: 3500, level: 8, change: 'same' },
];

const badges: Badge[] = [
  { id: '1', name: 'Newcomer', icon: <Star className="w-5 h-5" />, earned: true, earnedDate: 'Sep 2025', description: 'Welcome to EduVerse!' },
  { id: '2', name: 'Scholar', icon: <Award className="w-5 h-5" />, earned: true, earnedDate: 'Oct 2025', description: 'Complete 5 courses' },
  { id: '3', name: 'Achiever', icon: <Trophy className="w-5 h-5" />, earned: true, earnedDate: 'Nov 2025', description: 'Earn 1000 points' },
  { id: '4', name: 'Champion', icon: <Crown className="w-5 h-5" />, earned: false, description: 'Reach top 3 in leaderboard' },
  { id: '5', name: 'Mentor', icon: <Users className="w-5 h-5" />, earned: false, description: 'Help 10 students' },
  { id: '6', name: 'Perfectionist', icon: <Target className="w-5 h-5" />, earned: true, earnedDate: 'Dec 2025', description: 'Get 5 perfect scores' },
];

export function Gamification() {
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'leaderboard'>('overview');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const currentPoints = 4200;
  const currentLevel = 10;
  const pointsToNextLevel = 5000;
  const streak = 5;

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-slate-400 to-slate-500';
      case 'rare': return 'from-blue-400 to-blue-600';
      case 'epic': return 'from-purple-400 to-purple-600';
      case 'legendary': return 'from-amber-400 to-orange-500';
      default: return 'from-slate-400 to-slate-500';
    }
  };

  const getRarityBg = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-slate-50 border-slate-100';
      case 'rare': return 'bg-blue-50 border-blue-200';
      case 'epic': return 'bg-purple-50 border-purple-200';
      case 'legendary': return 'bg-amber-50 border-amber-200';
      default: return 'bg-slate-50 border-slate-100';
    }
  };

  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory);

  const unlockedAchievements = achievements.filter(a => a.unlocked).length;
  const { t, isRTL } = useLanguage();
  const { isDark } = useTheme();

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Trophy className="w-8 h-8" />
              <span className="text-sm bg-white/20 px-3 py-1 rounded-full">{t('level')} {currentLevel}</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">{t('gamificationAchievements')}</h1>
            <p className="text-amber-100">{isRTL ? 'اكسب نقاط، افتح شارات، وتسلق لوحة المتصدرين!' : 'Earn points, unlock badges, and climb the leaderboard!'}</p>
          </div>
          <div className={`${isRTL ? 'text-left' : 'text-right'}`}>
            <div className="text-5xl font-bold mb-1">{currentPoints.toLocaleString()}</div>
            <p className="text-amber-200">{t('totalPoints')}</p>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-5 h-5 text-orange-300" />
              <span className="text-sm text-amber-200">{t('streak')}</span>
            </div>
            <p className="text-2xl font-bold">{streak} {isRTL ? 'يوم' : 'days'}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <Medal className="w-5 h-5 text-amber-300" />
              <span className="text-sm text-amber-200">{t('achievements')}</span>
            </div>
            <p className="text-2xl font-bold">{unlockedAchievements}/{achievements.length}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-300" />
              <span className="text-sm text-amber-200">{t('rank')}</span>
            </div>
            <p className="text-2xl font-bold">#5</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 text-yellow-300" />
              <span className="text-sm text-amber-200">{t('xpToNextLevel')}</span>
            </div>
            <p className="text-2xl font-bold">{pointsToNextLevel - currentPoints} {isRTL ? 'نقطة' : 'pts'}</p>
          </div>
        </div>

        {/* Level Progress */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span>{t('level')} {currentLevel}</span>
            <span>{t('level')} {currentLevel + 1}</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-yellow-300 to-orange-300 h-3 rounded-full transition-all"
              style={{ width: `${(currentPoints / pointsToNextLevel) * 100}%` }}
            />
          </div>
          <p className="text-sm text-amber-200 mt-2 text-center">
            {currentPoints.toLocaleString()} / {pointsToNextLevel.toLocaleString()} XP
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="glass rounded-[2.5rem] flex gap-2 p-2">
        {[
          { id: 'overview', label: isRTL ? 'نظرة عامة' : 'Overview', icon: <Sparkles className="w-4 h-4" /> },
          { id: 'achievements', label: t('achievements'), icon: <Trophy className="w-4 h-4" /> },
          { id: 'leaderboard', label: t('leaderboard'), icon: <Medal className="w-4 h-4" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Badges */}
          <div className="glass rounded-[2.5rem] overflow-hidden">
            <div className={`${isDark ? 'bg-white/5 border-b border-white/5' : 'bg-gradient-to-r from-background-light to-white border-b border-slate-100'} p-4`}>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'} flex items-center gap-2`}>
                <Award className="w-5 h-5 text-amber-500" />
                My Badges
              </h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-3 gap-3">
                {badges.map((badge) => (
                  <div
                    key={badge.id}
                    className={`relative p-4 rounded-xl border-2 text-center transition-all ${
                      badge.earned 
                        ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200' 
                        : `${isDark ? 'bg-white/5 border-white/5' : 'bg-background-light border-slate-100'} opacity-50`
                    }`}
                  >
                    <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-2 ${
                      badge.earned ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white' : `${isDark ? 'bg-white/10' : 'bg-slate-200'} text-slate-500`
                    }`}>
                      {badge.earned ? badge.icon : <Lock className="w-5 h-5" />}
                    </div>
                    <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{badge.name}</p>
                    {badge.earned && badge.earnedDate && (
                      <p className="text-xs text-slate-500 mt-1">{badge.earnedDate}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Daily Challenges */}
          <div className="glass rounded-[2.5rem] overflow-hidden">
            <div className={`${isDark ? 'bg-white/5 border-b border-white/5' : 'bg-gradient-to-r from-background-light to-white border-b border-slate-100'} p-4`}>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'} flex items-center gap-2`}>
                <Target className="w-5 h-5 text-[#7C3AED]" />
                Daily Challenges
              </h3>
            </div>
            <div className="p-4 space-y-3">
              {[
                { task: 'Complete 1 quiz', progress: 1, max: 1, points: 50, done: true },
                { task: 'Study for 30 minutes', progress: 25, max: 30, points: 30, done: false },
                { task: 'Review flashcards', progress: 0, max: 1, points: 25, done: false },
                { task: 'Help a classmate', progress: 0, max: 1, points: 40, done: false },
              ].map((challenge, idx) => (
                <div key={idx} className={`p-3 rounded-lg border ${challenge.done ? 'bg-green-50 border-green-200' : `${isDark ? 'bg-white/5 border-white/5' : 'bg-background-light border-slate-100'}`}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {challenge.done ? (
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <Star className="w-4 h-4 text-white" />
                        </div>
                      ) : (
                        <div className={`w-6 h-6 ${isDark ? 'bg-white/10' : 'bg-slate-200'} rounded-full`} />
                      )}
                      <span className={`text-sm font-medium ${challenge.done ? 'text-green-700 line-through' : `${isDark ? 'text-white' : 'text-slate-800'}`}`}>
                        {challenge.task}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-amber-600">+{challenge.points} pts</span>
                  </div>
                  {!challenge.done && (
                    <div className={`w-full ${isDark ? 'bg-white/10' : 'bg-slate-200'} rounded-full h-1.5 ml-8`}>
                      <div 
                        className="bg-[#7C3AED]/100 h-1.5 rounded-full transition-all"
                        style={{ width: `${(challenge.progress / challenge.max) * 100}%` }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Rewards Shop Preview */}
          <div className="glass rounded-[2.5rem] overflow-hidden lg:col-span-2">
            <div className={`${isDark ? 'bg-white/5 border-b border-white/5' : 'bg-gradient-to-r from-background-light to-white border-b border-slate-100'} p-4 flex items-center justify-between`}>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'} flex items-center gap-2`}>
                <Gift className="w-5 h-5 text-pink-500" />
                Rewards Shop
              </h3>
              <button className="text-sm text-[#7C3AED] font-medium flex items-center gap-1">
                View All <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-4 gap-4">
                {[
                  { name: 'Profile Badge', cost: 500, icon: '🎖️' },
                  { name: 'Custom Theme', cost: 1000, icon: '🎨' },
                  { name: 'Priority Support', cost: 2000, icon: '⚡' },
                  { name: 'Certificate Frame', cost: 3000, icon: '🖼️' },
                ].map((reward, idx) => (
                  <div key={idx} className={`p-4 border ${isDark ? 'border-white/5' : 'border-slate-100'} rounded-xl text-center hover:border-amber-300 hover:bg-amber-50 transition-all cursor-pointer`}>
                    <div className="text-4xl mb-2">{reward.icon}</div>
                    <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'} mb-1`}>{reward.name}</p>
                    <p className="text-sm font-bold text-amber-600">{reward.cost} pts</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Achievements Tab */}
      {activeTab === 'achievements' && (
        <div className="space-y-4">
          {/* Category Filter */}
          <div className="flex gap-2">
            {['all', 'academic', 'engagement', 'streak', 'social'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                  selectedCategory === cat
                    ? 'bg-amber-100 text-amber-700 border-2 border-amber-300'
                    : `${isDark ? 'bg-white/5 text-slate-400' : 'bg-slate-50 text-slate-600'} border-2 border-transparent ${isDark ? 'hover:bg-white/10' : 'hover:bg-slate-200'}`
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Achievements Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`relative p-5 rounded-xl border-2 transition-all ${
                  achievement.unlocked 
                    ? getRarityBg(achievement.rarity)
                    : `${isDark ? 'bg-white/5 border-white/5' : 'bg-background-light border-slate-100'}`
                }`}
              >
                {achievement.unlocked && (
                  <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${getRarityColor(achievement.rarity)}`}>
                    {achievement.rarity}
                  </div>
                )}
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                    achievement.unlocked 
                      ? `bg-gradient-to-br ${getRarityColor(achievement.rarity)} text-white`
                      : `${isDark ? 'bg-white/10' : 'bg-slate-200'} text-slate-500`
                  }`}>
                    {achievement.unlocked ? achievement.icon : <Lock className="w-6 h-6" />}
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'} mb-1`}>{achievement.title}</h4>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-3`}>{achievement.description}</p>
                    
                    {!achievement.unlocked && (
                      <div className="mb-2">
                        <div className={`flex justify-between text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-1`}>
                          <span>Progress</span>
                          <span>{achievement.progress}/{achievement.maxProgress}</span>
                        </div>
                        <div className={`w-full ${isDark ? 'bg-white/10' : 'bg-slate-200'} rounded-full h-2`}>
                          <div 
                            className={`h-2 rounded-full bg-gradient-to-r ${getRarityColor(achievement.rarity)}`}
                            style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-500" />
                      <span className="text-sm font-bold text-amber-600">+{achievement.points} points</span>
                      {achievement.unlocked && (
                        <span className="ml-auto px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                          Unlocked!
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Leaderboard Tab */}
      {activeTab === 'leaderboard' && (
        <div className="glass rounded-[2.5rem] overflow-hidden">
          <div className={`${isDark ? 'bg-white/5 border-b border-white/5' : 'bg-gradient-to-r from-background-light to-white border-b border-slate-100'} p-4`}>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Weekly Leaderboard</h3>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Top performers this week</p>
          </div>
          <div className={`divide-y ${isDark ? 'divide-white/5' : 'divide-slate-100'}`}>
            {leaderboard.map((entry, idx) => (
              <div
                key={entry.rank}
                className={`flex items-center gap-4 p-4 transition-all ${
                  entry.isCurrentUser ? 'bg-amber-50' : `${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`
                }`}
              >
                {/* Rank */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  entry.rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white' :
                  entry.rank === 2 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-white' :
                  entry.rank === 3 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white' :
                  'bg-slate-50 text-slate-600'
                }`}>
                  {entry.rank <= 3 ? (
                    <Crown className="w-5 h-5" />
                  ) : (
                    entry.rank
                  )}
                </div>

                {/* Avatar */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${
                  entry.isCurrentUser ? 'bg-gradient-to-br from-[#7C3AED] to-purple-600' : 'bg-gradient-to-br from-slate-400 to-slate-500'
                }`}>
                  {entry.avatar}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{entry.name}</p>
                    {entry.isCurrentUser && (
                      <span className="px-2 py-0.5 bg-[#7C3AED]/10 text-[#7C3AED] rounded text-xs font-medium">You</span>
                    )}
                  </div>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Level {entry.level}</p>
                </div>

                {/* Points */}
                <div className="text-right">
                  <p className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{entry.points.toLocaleString()}</p>
                  <p className="text-xs text-slate-500">points</p>
                </div>

                {/* Change Indicator */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  entry.change === 'up' ? 'bg-green-100 text-green-600' :
                  entry.change === 'down' ? 'bg-red-100 text-red-600' :
                  'bg-slate-50 text-slate-500'
                }`}>
                  {entry.change === 'up' && <TrendingUp className="w-4 h-4" />}
                  {entry.change === 'down' && <TrendingUp className="w-4 h-4 rotate-180" />}
                  {entry.change === 'same' && <span className="text-xs">—</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Gamification;
