import { useState, useMemo } from 'react';
import { aiFeatures } from './data';
import { FeatureId } from './types';
import { FeatureContent } from './features';
import { StatsCards, HeroSection, FeatureList, FeaturePanel } from './ui';

export function AIFeatures() {
  const [selectedFeature, setSelectedFeature] = useState<FeatureId>('chatbot');
  const [quizDifficulty, setQuizDifficulty] = useState('medium');

  const stats = useMemo(() => {
    const totalUsage = aiFeatures.reduce((sum, feature) => sum + feature.usageCount, 0);
    const mostUsedFeature = aiFeatures.reduce((prev, current) => 
      prev.usageCount > current.usageCount ? prev : current
    );
    return { totalUsage, mostUsedFeature };
  }, []);

  const selectedFeatureData = aiFeatures.find(f => f.id === selectedFeature) || null;

  return (
    <div className="p-6">
      <HeroSection />
      <StatsCards 
        totalFeatures={aiFeatures.length}
        totalUsage={stats.totalUsage}
        mostUsedFeature={stats.mostUsedFeature}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <FeatureList 
            features={aiFeatures}
            selectedFeature={selectedFeature}
            onSelectFeature={setSelectedFeature}
          />
        </div>

        <div>
          <FeaturePanel feature={selectedFeatureData}>
            <FeatureContent 
              selectedFeature={selectedFeature}
              quizDifficulty={quizDifficulty}
              onQuizDifficultyChange={setQuizDifficulty}
            />
          </FeaturePanel>
        </div>
      </div>
    </div>
  );
}
