interface StepProgressProps {
  totalSteps: number;
  currentStep: number;
  onStepSelect: (step: number) => void;
  isDark?: boolean;
  accentColor?: string;
}

export function StepProgress({
  totalSteps,
  currentStep,
  onStepSelect,
  isDark,
  accentColor = '#3b82f6',
}: StepProgressProps) {
  if (totalSteps <= 1) return null;

  return (
    <div className="flex gap-2 w-full max-w-2xl mx-auto mb-6">
      {Array.from({ length: totalSteps }).map((_, idx) => (
        <button
          key={idx}
          onClick={() => onStepSelect(idx)}
          className={`flex-1 h-3 rounded-full transition-all duration-300 ${
            idx === currentStep
              ? 'transform scale-y-110'
              : idx < currentStep
                ? 'opacity-60 hover:opacity-80'
                : isDark
                  ? 'bg-white/10 hover:bg-white/20'
                  : 'bg-slate-200 hover:bg-slate-300'
          }`}
          style={{
            backgroundColor: idx <= currentStep ? accentColor : undefined,
          }}
          aria-label={`Go to step ${idx + 1}`}
        />
      ))}
    </div>
  );
}
