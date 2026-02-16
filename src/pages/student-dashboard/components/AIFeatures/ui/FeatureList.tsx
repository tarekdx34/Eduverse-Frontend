import { AIFeature, FeatureId } from '../types';
import { useTheme } from '../../../contexts/ThemeContext';

interface FeatureListProps {
  features: AIFeature[];
  selectedFeature: FeatureId | null;
  onSelectFeature: (featureId: FeatureId) => void;
}

export function FeatureList({ features, selectedFeature, onSelectFeature }: FeatureListProps) {
  const { isDark } = useTheme();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Explore AI Features</h3>
        <button className="text-[#7C3AED] text-sm font-bold hover:underline">View All</button>
      </div>

      <div className="space-y-4">
        {features.map((feature) => {
          const Icon = feature.icon;
          const isSelected = selectedFeature === feature.id;

          return (
            <div
              key={feature.id}
              onClick={() => onSelectFeature(feature.id as FeatureId)}
              className={`p-4 rounded-2xl cursor-pointer group transition-all ${
                isSelected
                  ? isDark
                    ? 'bg-[#7C3AED]/10 border-2 border-[#7C3AED] relative overflow-hidden'
                    : 'bg-[#7C3AED]/5 border-2 border-[#7C3AED] relative overflow-hidden'
                  : 'glass hover:border-[#7C3AED]/50'
              }`}
            >
              {isSelected && (
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#7C3AED]/10 rounded-full blur-3xl -mr-12 -mt-12"></div>
              )}
              <div className="flex gap-4 relative z-10">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                  isSelected
                    ? `${feature.color} text-white shadow-lg shadow-${feature.color}/20`
                    : `${feature.bgLight} ${feature.textColor}`
                } ${!isSelected && isDark ? 'border border-white/10' : !isSelected ? `border ${feature.borderColor}/20` : ''}`}
                  style={!isSelected && isDark ? {
                    boxShadow: `0 0 0 transparent`,
                  } : undefined}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{feature.title}</h4>
                    {feature.badge && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        feature.badge === 'Most Used' ? 'bg-[#7C3AED]/20 text-[#7C3AED]' :
                        feature.badge === 'Popular' ? 'bg-blue-500/10 text-blue-500' :
                        'bg-purple-500/10 text-purple-500'
                      }`}>
                        {feature.badge === 'Most Used' ? 'Active' : feature.badge}
                      </span>
                    )}
                  </div>
                  <p className={`text-xs mt-1 line-clamp-2 ${
                    isSelected
                      ? isDark ? 'text-slate-300' : 'text-slate-600'
                      : isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}>{feature.description}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {feature.features.slice(0, 2).map((item, idx) => (
                      <span key={idx} className={`px-2 py-1 rounded-md text-[10px] ${
                        isSelected
                          ? isDark ? 'bg-white/10 text-[#7C3AED] font-semibold' : 'bg-white/50 text-[#7C3AED] font-semibold'
                          : isDark ? 'bg-white/5 text-slate-500' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
