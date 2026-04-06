import { useState } from 'react';
import type { LabInstruction } from '../../../../../services/api/labService';
import { StepProgress } from './shared/StepProgress';
import { InstructionCard } from './shared/InstructionCard';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface InstructionViewerProps {
  instructions: LabInstruction[];
  isDark?: boolean;
  accentColor?: string;
}

export function InstructionViewer({ instructions, isDark, accentColor = '#3b82f6' }: InstructionViewerProps) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!instructions || instructions.length === 0) {
    return (
      <div className={`p-6 text-center rounded-xl ${isDark ? 'bg-white/5 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
        No instructions available for this lab.
      </div>
    );
  }

  // Ensure they are sorted by orderIndex
  const sortedInstructions = [...instructions].sort((a, b) => a.orderIndex - b.orderIndex);
  const current = sortedInstructions[currentStep];

  const canGoPrev = currentStep > 0;
  const canGoNext = currentStep < sortedInstructions.length - 1;

  return (
    <div className="space-y-6">
      <StepProgress
        totalSteps={sortedInstructions.length}
        currentStep={currentStep}
        onStepSelect={setCurrentStep}
        isDark={isDark}
        accentColor={accentColor}
      />

      <InstructionCard
        instruction={current}
        stepNumber={currentStep + 1}
        totalSteps={sortedInstructions.length}
        isDark={isDark}
      />

      <div className="flex items-center justify-between pt-4">
        <button
          disabled={!canGoPrev}
          onClick={() => setCurrentStep((s) => s - 1)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            !canGoPrev
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-slate-100 dark:hover:bg-white/5'
          } ${isDark ? 'text-slate-300' : 'text-slate-600'}`}
        >
          <ArrowLeft className="w-5 h-5" />
          Previous
        </button>

        <button
          disabled={!canGoNext}
          onClick={() => setCurrentStep((s) => s + 1)}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium text-white transition-opacity ${
            !canGoNext ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
          }`}
          style={{ backgroundColor: accentColor }}
        >
          Next
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
