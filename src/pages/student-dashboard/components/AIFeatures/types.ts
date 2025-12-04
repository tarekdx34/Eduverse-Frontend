import { LucideIcon } from 'lucide-react';

export interface AIFeature {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: LucideIcon;
  color: string;
  bgLight: string;
  bgHover: string;
  textColor: string;
  borderColor: string;
  usageCount: number;
  lastUsed: string;
  features: string[];
  badge?: string;
}

export type FeatureId = 'summarizer' | 'quiz' | 'feedback' | 'chatbot' | 'voice' | 'recommendation' | 'image-to-text';
