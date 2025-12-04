import { ReactNode } from 'react';
import { FeatureId } from './types';

export interface FeatureContentProps {
  selectedFeature: FeatureId;
  quizDifficulty?: string;
  onQuizDifficultyChange?: (difficulty: string) => void;
}

export type RenderFeatureContentFunction = (props: FeatureContentProps) => ReactNode;
