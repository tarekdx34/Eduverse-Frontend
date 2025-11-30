import { TrendingUp, TrendingDown } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { useLanguage } from '../contexts/LanguageContext';

export function GamificationSection() {
  const [activeTab, setActiveTab] = useState<'follow' | 'global'>('follow');
  const { t, language } = useLanguage();

  const dailyQuests = [
    {
      title: { en: 'Daily Quest: Quiz Master', ar: 'مهمة يومية: سيد الاختبارات' },
      description: {
        en: 'Complete 3 quizzes today to earn 100 XP',
        ar: 'أكمل 3 اختبارات اليوم لكسب 100 نقطة خبرة',
      },
      xp: 100,
      progress: 2,
      total: 3,
    },
    {
      title: { en: 'Weekly Quest: Assignment Ace', ar: 'مهمة أسبوعية: بطل الواجبات' },
      description: {
        en: 'Submit all assignments this week to earn 250 XP',
        ar: 'قدم جميع الواجبات هذا الأسبوع لكسب 250 نقطة خبرة',
      },
      xp: 250,
      progress: 4,
      total: 5,
    },
  ];

  const leaderboardData = [
    { rank: 1, name: 'Alistair', nameAr: 'أحمد محمد', level: 15, xp: 5000, change: 1 },
    { rank: 2, name: 'Isolde', nameAr: 'سارة علي', level: 14, xp: 4800, change: -1 },
    { rank: 3, name: 'Gareth', nameAr: 'محمد خالد', level: 13, xp: 4500, change: 2 },
    { rank: 4, name: 'Rowan', nameAr: 'فاطمة حسن', level: 12, xp: 4300, change: -2 },
    { rank: 5, name: 'Finnian', nameAr: 'عمر يوسف', level: 11, xp: 4000, change: 1 },
  ];

  const badges = [
    {
      title: { en: 'Quiz Whiz', ar: 'عبقري الاختبارات' },
      description: { en: 'Complete 50 quizzes', ar: 'أكمل 50 اختبار' },
      icon: '🎯',
      unlocked: true,
      rarity: 'legendary',
    },
    {
      title: { en: 'Assignment Ace', ar: 'بطل الواجبات' },
      description: { en: 'Submit 100 assignments', ar: 'قدم 100 واجب' },
      icon: '📝',
      unlocked: true,
      rarity: 'epic',
    },
    {
      title: { en: 'Lab Legend', ar: 'أسطورة المختبر' },
      description: { en: 'Attend all lab sessions', ar: 'احضر جميع جلسات المختبر' },
      icon: '🔬',
      unlocked: true,
      rarity: 'rare',
    },
    {
      title: { en: 'Exam Expert', ar: 'خبير الامتحانات' },
      description: { en: 'Score 90+ on 10 exams', ar: 'احصل على 90+ في 10 امتحانات' },
      icon: '📊',
      unlocked: true,
      rarity: 'epic',
    },
    {
      title: { en: 'Participation Pro', ar: 'محترف المشاركة' },
      description: { en: 'Participate in 50 discussions', ar: 'شارك في 50 نقاش' },
      icon: '💬',
      unlocked: false,
      rarity: 'rare',
    },
    {
      title: { en: 'Perfect Attendance', ar: 'الحضور المثالي' },
      description: { en: 'Never miss a class', ar: 'لا تفوت أي حصة' },
      icon: '✓',
      unlocked: false,
      rarity: 'legendary',
    },
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'from-yellow-600 to-orange-600';
      case 'epic':
        return 'from-purple-600 to-pink-600';
      case 'rare':
        return 'from-blue-600 to-cyan-600';
      default:
        return 'from-gray-600 to-gray-700';
    }
  };

  return (
    <section id="gamification" className="py-20 lg:py-32 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl mb-4">
            {t('Gamification', 'التحفيز')}{' '}
            <span className="bg-gradient-to-r from-chart-1 to-chart-2 bg-clip-text text-transparent">
              {t('System', 'النظام')}
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t(
              'Earn XP, unlock badges, and climb the leaderboard',
              'اكسب نقاط الخبرة، وافتح الشارات، وتسلق لوحة المتصدرين'
            )}
          </p>
        </div>

        {/* Daily & Weekly Quests */}
        <div className="mb-16">
          <h3 className="text-2xl mb-6">
            {t('Daily & Weekly Quests', 'المهام اليومية والأسبوعية')}
          </h3>
          <div className="grid lg:grid-cols-2 gap-6">
            {dailyQuests.map((quest, index) => (
              <div
                key={index}
                className="bg-card border border-border rounded-2xl p-6 hover:border-chart-1 transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="mb-2">{quest.title[language]}</h4>
                    <p className="text-sm text-muted-foreground">{quest.description[language]}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl bg-gradient-to-r from-chart-1 to-chart-2 bg-clip-text text-transparent">
                      {quest.xp} XP
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-muted-foreground mb-2">
                    <span>{t('Progress', 'التقدم')}</span>
                    <span>
                      {quest.progress}/{quest.total}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-chart-1 to-chart-2 transition-all duration-500"
                      style={{ width: `${(quest.progress / quest.total) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <Button className="w-full" disabled={quest.progress < quest.total}>
                  {t('Claim XP', 'اجمع النقاط')}
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="mb-16">
          <h3 className="text-2xl mb-6">{t('Leaderboard', 'لوحة المتصدرين')}</h3>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('follow')}
              className={`flex-1 py-3 px-6 rounded-lg transition-all ${
                activeTab === 'follow'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {t('Follow Adventurers', 'متابعة المغامرين')}
            </button>
            <button
              onClick={() => setActiveTab('global')}
              className={`flex-1 py-3 px-6 rounded-lg transition-all ${
                activeTab === 'global'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {t('Global Heroes', 'الأبطال العالميون')}
            </button>
          </div>

          {/* Leaderboard Table */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left py-4 px-6">{t('Rank', 'المرتبة')}</th>
                  <th className="text-left py-4 px-6">{t('Hero', 'البطل')}</th>
                  <th className="text-left py-4 px-6">{t('Level', 'المستوى')}</th>
                  <th className="text-left py-4 px-6">XP</th>
                  <th className="text-left py-4 px-6">{t('Change', 'التغيير')}</th>
                </tr>
              </thead>
              <tbody>
                {leaderboardData.map((player, index) => (
                  <tr
                    key={index}
                    className="border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                          player.rank === 1
                            ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white'
                            : player.rank === 2
                              ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white'
                              : player.rank === 3
                                ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white'
                                : 'bg-muted'
                        }`}
                      >
                        {player.rank}
                      </div>
                    </td>
                    <td className="py-4 px-6">{language === 'en' ? player.name : player.nameAr}</td>
                    <td className="py-4 px-6">{player.level}</td>
                    <td className="py-4 px-6">{player.xp.toLocaleString()}</td>
                    <td className="py-4 px-6">
                      <div
                        className={`flex items-center gap-1 ${
                          player.change > 0
                            ? 'text-green-500'
                            : player.change < 0
                              ? 'text-red-500'
                              : 'text-muted-foreground'
                        }`}
                      >
                        {player.change > 0 ? (
                          <>
                            <TrendingUp className="h-4 w-4" />
                            <span>+{player.change}</span>
                          </>
                        ) : player.change < 0 ? (
                          <>
                            <TrendingDown className="h-4 w-4" />
                            <span>{player.change}</span>
                          </>
                        ) : (
                          <span>-</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Achievements & Badges */}
        <div>
          <h3 className="text-2xl mb-6">{t('Achievements & Badges', 'الإنجازات والشارات')}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {badges.map((badge, index) => (
              <div key={index} className="group relative">
                <div
                  className={`relative aspect-square rounded-2xl bg-gradient-to-br ${getRarityColor(badge.rarity)} p-1 ${
                    !badge.unlocked && 'opacity-40 grayscale'
                  }`}
                >
                  <div className="w-full h-full bg-card rounded-xl flex flex-col items-center justify-center p-4 relative overflow-hidden">
                    {/* Glow Effect */}
                    {badge.unlocked && (
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${getRarityColor(badge.rarity)} opacity-20 blur-xl`}
                      ></div>
                    )}

                    {/* Icon */}
                    <div className="text-5xl mb-2 relative z-10">{badge.icon}</div>

                    {/* Lock Overlay */}
                    {!badge.unlocked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                        <div className="text-4xl">🔒</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Badge Info */}
                <div className="mt-3 text-center">
                  <div className="text-sm mb-1">{badge.title[language]}</div>

                  {/* Tooltip on Hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute left-1/2 -translate-x-1/2 mt-2 bg-popover border border-border rounded-lg p-3 text-xs whitespace-nowrap z-10 pointer-events-none shadow-lg">
                    {badge.description[language]}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
