import { FeatureId } from '../types';
import { SummarizerContent } from './SummarizerContent';
import { QuizContent } from './QuizContent';
import { FeedbackContent } from './FeedbackContent';
import { ChatbotContent } from './ChatbotContent';
import { VoiceContent } from './VoiceContent';
import { RecommendationContent } from './RecommendationContent';
import { ImageToTextContent } from './ImageToTextContent';

interface FeatureContentProps {
  selectedFeature: FeatureId;
  quizDifficulty: string;
  onQuizDifficultyChange: (difficulty: string) => void;
}

export function FeatureContent({
  selectedFeature,
  quizDifficulty,
  onQuizDifficultyChange,
}: FeatureContentProps) {
  switch (selectedFeature) {
    case 'summarizer':
      return <SummarizerContent />;
    case 'quiz':
      return <QuizContent quizDifficulty={quizDifficulty} onDifficultyChange={onQuizDifficultyChange} />;
    case 'feedback':
      return <FeedbackContent />;
    case 'chatbot':
      return <ChatbotContent />;
    case 'voice':
      return <VoiceContent />;
    case 'recommendation':
      return <RecommendationContent />;
    case 'image-to-text':
      return <ImageToTextContent />;
    default:
      return null;
  }
}
