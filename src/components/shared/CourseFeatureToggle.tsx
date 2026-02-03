import { useState } from 'react';
import { Settings, Check, X, Eye, EyeOff, Lock, Unlock, Info } from 'lucide-react';

export interface CourseFeature {
  id: string;
  name: string;
  description: string;
  category: 'content' | 'interaction' | 'assessment' | 'ai';
  enabled: boolean;
  locked?: boolean;
  icon?: React.ElementType;
}

const DEFAULT_FEATURES: CourseFeature[] = [
  // Content Features
  { id: 'lectures', name: 'Lectures', description: 'Video and live lectures', category: 'content', enabled: true },
  { id: 'materials', name: 'Course Materials', description: 'PDFs, documents, and resources', category: 'content', enabled: true },
  { id: 'syllabus', name: 'Syllabus', description: 'Course outline and schedule', category: 'content', enabled: true, locked: true },
  
  // Interaction Features
  { id: 'discussions', name: 'Discussion Forums', description: 'Student discussion boards', category: 'interaction', enabled: true },
  { id: 'announcements', name: 'Announcements', description: 'Course announcements', category: 'interaction', enabled: true, locked: true },
  { id: 'messaging', name: 'Direct Messaging', description: 'Private student messages', category: 'interaction', enabled: true },
  { id: 'office-hours', name: 'Office Hours', description: 'Virtual office hours booking', category: 'interaction', enabled: false },
  
  // Assessment Features
  { id: 'assignments', name: 'Assignments', description: 'Homework and projects', category: 'assessment', enabled: true },
  { id: 'quizzes', name: 'Quizzes', description: 'Online quizzes and tests', category: 'assessment', enabled: true },
  { id: 'grades', name: 'Grade Book', description: 'Student can view grades', category: 'assessment', enabled: true },
  { id: 'peer-review', name: 'Peer Review', description: 'Student peer assessments', category: 'assessment', enabled: false },
  
  // AI Features
  { id: 'ai-tutor', name: 'AI Tutor', description: 'AI-powered student assistance', category: 'ai', enabled: true },
  { id: 'ai-quiz-gen', name: 'AI Quiz Generator', description: 'Auto-generate quiz questions', category: 'ai', enabled: true },
  { id: 'ai-grading', name: 'AI Auto-Grading', description: 'Automated assignment grading', category: 'ai', enabled: false },
  { id: 'ai-attendance', name: 'AI Attendance', description: 'Photo-based attendance', category: 'ai', enabled: false },
];

interface CourseFeatureToggleProps {
  courseId: string;
  courseName: string;
  features?: CourseFeature[];
  onFeaturesChange: (features: CourseFeature[]) => void;
  className?: string;
}

const categoryLabels: Record<string, { label: string; color: string }> = {
  content: { label: 'Content', color: 'bg-blue-100 text-blue-700' },
  interaction: { label: 'Interaction', color: 'bg-green-100 text-green-700' },
  assessment: { label: 'Assessment', color: 'bg-purple-100 text-purple-700' },
  ai: { label: 'AI Tools', color: 'bg-orange-100 text-orange-700' },
};

export function CourseFeatureToggle({
  courseId,
  courseName,
  features: initialFeatures = DEFAULT_FEATURES,
  onFeaturesChange,
  className = '',
}: CourseFeatureToggleProps) {
  const [features, setFeatures] = useState<CourseFeature[]>(initialFeatures);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['content', 'interaction', 'assessment', 'ai'])
  );

  const toggleFeature = (featureId: string) => {
    const feature = features.find((f) => f.id === featureId);
    if (feature?.locked) return;

    const updatedFeatures = features.map((f) =>
      f.id === featureId ? { ...f, enabled: !f.enabled } : f
    );
    setFeatures(updatedFeatures);
    onFeaturesChange(updatedFeatures);
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const enableAllInCategory = (category: string) => {
    const updatedFeatures = features.map((f) =>
      f.category === category && !f.locked ? { ...f, enabled: true } : f
    );
    setFeatures(updatedFeatures);
    onFeaturesChange(updatedFeatures);
  };

  const disableAllInCategory = (category: string) => {
    const updatedFeatures = features.map((f) =>
      f.category === category && !f.locked ? { ...f, enabled: false } : f
    );
    setFeatures(updatedFeatures);
    onFeaturesChange(updatedFeatures);
  };

  const groupedFeatures = features.reduce((acc, feature) => {
    if (!acc[feature.category]) {
      acc[feature.category] = [];
    }
    acc[feature.category].push(feature);
    return acc;
  }, {} as Record<string, CourseFeature[]>);

  const enabledCount = features.filter((f) => f.enabled).length;
  const totalCount = features.length;

  return (
    <div className={`bg-white rounded-xl border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Settings className="text-indigo-600" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Course Features</h3>
              <p className="text-sm text-gray-600">
                {courseName} • {enabledCount}/{totalCount} features enabled
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features by Category */}
      <div className="divide-y divide-gray-100">
        {Object.entries(groupedFeatures).map(([category, categoryFeatures]) => {
          const categoryInfo = categoryLabels[category];
          const isExpanded = expandedCategories.has(category);
          const enabledInCategory = categoryFeatures.filter((f) => f.enabled).length;

          return (
            <div key={category}>
              {/* Category Header */}
              <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleCategory(category)}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${categoryInfo.color}`}
                  >
                    {categoryInfo.label}
                  </span>
                  <span className="text-sm text-gray-500">
                    {enabledInCategory}/{categoryFeatures.length} enabled
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      enableAllInCategory(category);
                    }}
                    className="px-2 py-1 text-xs text-green-600 hover:bg-green-50 rounded transition-colors"
                  >
                    Enable All
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      disableAllInCategory(category);
                    }}
                    className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    Disable All
                  </button>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Category Features */}
              {isExpanded && (
                <div className="px-4 pb-4 space-y-2">
                  {categoryFeatures.map((feature) => (
                    <div
                      key={feature.id}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                        feature.enabled
                          ? 'bg-green-50 border-green-200'
                          : 'bg-gray-50 border-gray-200'
                      } ${feature.locked ? 'opacity-75' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            feature.enabled ? 'bg-green-100' : 'bg-gray-200'
                          }`}
                        >
                          {feature.enabled ? (
                            <Eye size={16} className="text-green-600" />
                          ) : (
                            <EyeOff size={16} className="text-gray-500" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{feature.name}</span>
                            {feature.locked && (
                              <Lock size={12} className="text-gray-400" title="Required feature" />
                            )}
                          </div>
                          <p className="text-xs text-gray-500">{feature.description}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => toggleFeature(feature.id)}
                        disabled={feature.locked}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          feature.enabled ? 'bg-green-500' : 'bg-gray-300'
                        } ${feature.locked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            feature.enabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-start gap-2 text-xs text-gray-500">
          <Info size={14} className="flex-shrink-0 mt-0.5" />
          <p>
            Locked features (<Lock size={10} className="inline" />) are required for the course to function properly.
            Disabling features will hide them from students immediately.
          </p>
        </div>
      </div>
    </div>
  );
}

export default CourseFeatureToggle;
