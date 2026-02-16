import { Zap, Clock, Sparkles } from 'lucide-react';
import { ReactNode } from 'react';
import { AIFeature } from '../types';
import { useTheme } from '../../../contexts/ThemeContext';

interface FeaturePanelProps {
  feature: AIFeature | null;
  children?: ReactNode;
}

export function FeaturePanel({ feature, children }: FeaturePanelProps) {
  const { isDark } = useTheme();

  if (!feature) {
    return (
      <div className="glass rounded-[2.5rem] sticky top-6 overflow-hidden">
        <div className="text-center py-20 px-6">
          <div className="w-20 h-20 bg-gradient-to-br from-[#7C3AED]/20 to-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-10 h-10 text-[#7C3AED]" />
          </div>
          <h4 className={`font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>Ready to Begin?</h4>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Select any AI feature from the list to start enhancing your learning experience
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-[2.5rem] overflow-hidden">
      <div className={`p-6 border-b ${
        isDark ? 'border-white/5 bg-gradient-to-r from-[#7C3AED]/10 to-transparent' : `${feature.bgLight} border-slate-100`
      }`}>
        <div className="flex items-center gap-3 mb-3">
          <div className={`${feature.color} w-12 h-12 rounded-xl flex items-center justify-center shadow-lg`}>
            {(() => {
              const Icon = feature.icon;
              return <Icon className="w-6 h-6 text-white" />;
            })()}
          </div>
          <div>
            <h3 className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{feature.title}</h3>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{feature.subtitle}</p>
          </div>
        </div>
        <div className={`flex items-center gap-4 text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            <span>{feature.usageCount} uses</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{feature.lastUsed}</span>
          </div>
        </div>
      </div>
      <div className="p-6 min-h-screen overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
