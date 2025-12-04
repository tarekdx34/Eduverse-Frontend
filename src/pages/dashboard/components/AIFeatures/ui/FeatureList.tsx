import { ChevronRight } from 'lucide-react';
import { AIFeature, FeatureId } from '../types';

interface FeatureListProps {
  features: AIFeature[];
  selectedFeature: FeatureId | null;
  onSelectFeature: (featureId: FeatureId) => void;
}

export function FeatureList({ features, selectedFeature, onSelectFeature }: FeatureListProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-gray-50 to-white p-6 border-b border-gray-200">
        <h2 className="text-gray-900 mb-1">Explore AI Features</h2>
        <p className="text-gray-600 text-sm">Click any tool to start using it instantly</p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 gap-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            const isSelected = selectedFeature === feature.id;
            return (
              <div
                key={feature.id}
                onClick={() => onSelectFeature(feature.id as FeatureId)}
                className={`border-2 rounded-xl p-5 cursor-pointer transition-all ${
                  isSelected
                    ? `${feature.borderColor} ${feature.bgLight} shadow-lg scale-[1.02]`
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`${feature.color} w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md ${isSelected ? 'scale-110' : ''} transition-transform`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-gray-900">{feature.title}</h3>
                          {feature.badge && (
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              feature.badge === 'Most Used' ? 'bg-indigo-100 text-indigo-700' :
                              feature.badge === 'New' ? 'bg-green-100 text-green-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {feature.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mb-2">{feature.subtitle}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{feature.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        {feature.features.map((item, idx) => (
                          <span key={idx} className="px-3 py-1 bg-white border border-gray-200 text-gray-700 rounded-lg text-xs">
                            {item}
                          </span>
                        ))}
                      </div>
                      <ChevronRight className={`w-5 h-5 ${isSelected ? feature.textColor : 'text-gray-400'} flex-shrink-0 ml-2`} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
