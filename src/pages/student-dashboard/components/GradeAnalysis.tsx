import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  BarChart3,
  TrendingUp,
  Award,
  BookOpen,
  Target,
  Sparkles,
  Star,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Minus,
  Lightbulb,
  Brain,
  Zap,
} from 'lucide-react';

// --- Mock Data ---

const gradeDistribution: any[] = [];
const semesterGPA: any[] = [];
const courseRanking: any[] = [];
const topPerformers: any[] = [];
const needsFocus: any[] = [];
const recommendations: any[] = [];
const studyGoals: any[] = [];
const focusAreas: any[] = [];

// --- Component ---

export const GradeAnalysis = () => {
  const { isDark, primaryHex } = useTheme() as any;
  const accentColor = primaryHex || '#3b82f6';
  const { t } = useLanguage();
  const [activeAnalysisTab, setActiveAnalysisTab] = useState('overview');

  const maxGradeCount = gradeDistribution.length > 0 ? Math.max(...gradeDistribution.map((g) => g.count), 1) : 1;
  const maxGPA = 4.0;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'trends', label: 'Trends', icon: TrendingUp },
    { id: 'comparison', label: 'Comparison', icon: Award },
    { id: 'insights', label: 'Insights', icon: Lightbulb },
  ];

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-amber-400 to-yellow-500 text-white';
      case 2:
        return 'from-slate-300 to-gray-400 text-white';
      case 3:
        return 'from-amber-600 to-orange-700 text-white';
      default:
        return isDark
          ? 'from-white/10 to-white/5 text-slate-400'
          : 'from-slate-100 to-slate-200 text-slate-500';
    }
  };

  const getGPAColor = (gpa: number) => {
    if (gpa >= 3.5) return 'from-green-500 to-emerald-500';
    if (gpa >= 3.0) return 'from-blue-500 to-indigo-500';
    if (gpa >= 2.5) return 'from-amber-500 to-orange-500';
    return 'from-red-500 to-blue-500';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return isDark
          ? 'text-red-400 bg-red-500/10 border-red-500/20'
          : 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return isDark
          ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
          : 'text-amber-600 bg-amber-50 border-amber-200';
      case 'low':
        return isDark
          ? 'text-blue-400 bg-blue-500/10 border-blue-500/20'
          : 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return '';
    }
  };

  const currentGPA = 0;
  const gpaPercentage = (currentGPA / 4.0) * 100;
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (gpaPercentage / 100) * circumference;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Grade Analysis
          </h2>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
            Detailed Performance Insights
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div
        className={`${isDark ? 'bg-card-dark border border-white/5' : 'glass'} rounded-[2.5rem] flex gap-2 p-2`}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveAnalysisTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all text-sm ${
                activeAnalysisTab === tab.id
                  ? 'bg-[var(--accent-color)] text-white shadow-md'
                  : `${isDark ? 'text-slate-400 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-100'}`
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="text-center py-20">
        <BarChart3 className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
        <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
          No Analysis Data
        </h3>
        <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>
          Once you have graded assignments, we'll show your performance trends here.
        </p>
      </div>
    </div>
  );
};
