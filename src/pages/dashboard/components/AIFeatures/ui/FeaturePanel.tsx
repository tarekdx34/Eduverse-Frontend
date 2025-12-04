import { Zap, Clock, Sparkles } from 'lucide-react';
import { ReactNode } from 'react';
import { AIFeature } from '../types';

interface FeaturePanelProps {
  feature: AIFeature | null;
  children?: ReactNode;
}

export function FeaturePanel({ feature, children }: FeaturePanelProps) {
  if (!feature) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm sticky top-6 overflow-hidden">
        <div className="text-center py-20 px-6">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-10 h-10 text-indigo-600" />
          </div>
          <h4 className="text-gray-900 mb-2">Ready to Begin?</h4>
          <p className="text-sm text-gray-600">
            Select any AI feature from the list to start enhancing your learning experience
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm sticky top-6 overflow-hidden">
      <div className={`${feature.bgLight} border-b-2 ${feature.borderColor} p-6`}>
        <div className="flex items-center gap-3 mb-3">
          <div className={`${feature.color} w-12 h-12 rounded-xl flex items-center justify-center shadow-md`}>
            {(() => {
              const Icon = feature.icon;
              return <Icon className="w-6 h-6 text-white" />;
            })()}
          </div>
          <div>
            <h3 className="text-gray-900">{feature.title}</h3>
            <p className="text-xs text-gray-600">{feature.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-600">
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
      <div className="p-6 max-h-[calc(100vh-300px)] overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
