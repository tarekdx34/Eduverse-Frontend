import React, { useState, useEffect } from 'react';
import { Brain, Sparkles, Zap } from 'lucide-react';

interface AIProcessingAnimationProps {
  message?: string;
  duration?: number; // in milliseconds
  onComplete?: () => void;
  showNote?: boolean;
}

const processingTips = [
  'Analyzing content with AI...',
  'Detecting patterns...',
  'Processing data...',
  'Almost there...',
  'Finalizing results...',
];

export function AIProcessingAnimation({
  message = 'AI is processing...',
  duration = 5000,
  onComplete,
  showNote = true,
}: AIProcessingAnimationProps) {
  const [progress, setProgress] = useState(0);
  const [currentTip, setCurrentTip] = useState(0);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          if (onComplete) {
            setTimeout(onComplete, 500);
          }
          return 100;
        }
        return prev + 100 / (duration / 100);
      });
    }, 100);

    const tipInterval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % processingTips.length);
    }, 1500);

    return () => {
      clearInterval(progressInterval);
      clearInterval(tipInterval);
    };
  }, [duration, onComplete]);

  return (
    <div className="flex flex-col items-center justify-center p-12 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl min-h-[400px]">
      {/* Animated AI Icon */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-indigo-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
        <div className="relative p-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full">
          <Brain className="text-white animate-pulse" size={48} />
        </div>

        {/* Floating particles */}
        <div className="absolute -top-2 -right-2 animate-bounce">
          <Sparkles className="text-yellow-400" size={20} />
        </div>
        <div className="absolute -bottom-2 -left-2 animate-bounce delay-150">
          <Zap className="text-indigo-400" size={20} />
        </div>
      </div>

      {/* Progress Circle - Fixed overflow */}
      <div className="relative mb-6" style={{ width: '140px', height: '140px' }}>
        <svg
          className="transform -rotate-90"
          width="140"
          height="140"
          viewBox="0 0 140 140"
          style={{ overflow: 'visible' }}
        >
          <circle
            cx="70"
            cy="70"
            r="60"
            stroke="currentColor"
            strokeWidth="10"
            fill="transparent"
            className="text-gray-200"
          />
          <circle
            cx="70"
            cy="70"
            r="60"
            stroke="currentColor"
            strokeWidth="10"
            fill="transparent"
            strokeDasharray={`${2 * Math.PI * 60}`}
            strokeDashoffset={`${2 * Math.PI * 60 * (1 - progress / 100)}`}
            className="text-indigo-600 transition-all duration-300"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-bold text-indigo-600">{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Message */}
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{message}</h3>

      {/* Rotating Tips */}
      <p className="text-sm text-gray-600 mb-6 h-6 transition-opacity duration-300">
        {processingTips[currentTip]}
      </p>

      {/* Progress Bar */}
      <div className="w-full max-w-md bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Note */}
      {showNote && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg max-w-md">
          <p className="text-xs text-yellow-800 text-center">
            <strong>Note:</strong> This is a demo. Actual processing with real AI may take longer
            depending on file size and complexity.
          </p>
        </div>
      )}
    </div>
  );
}

export default AIProcessingAnimation;
