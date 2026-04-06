import { Paperclip } from 'lucide-react';
import type { LabInstruction } from '../../../../../../services/api/labService';

interface InstructionCardProps {
  instruction: LabInstruction;
  stepNumber: number;
  totalSteps: number;
  isDark?: boolean;
}

export function InstructionCard({
  instruction,
  stepNumber,
  totalSteps,
  isDark,
}: InstructionCardProps) {
  // If we had a markdown parser we would use it here.
  // For now, dangerouslySetInnerHTML or just direct render for plain text.
  
  return (
    <div
      className={`rounded-2xl p-6 ${
        isDark ? 'bg-white/5 border border-white/5' : 'bg-slate-50 border border-slate-100'
      }`}
    >
      <div className="flex items-center gap-3 mb-4">
        <span
          className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
            isDark ? 'bg-white/10 text-white' : 'bg-slate-200 text-slate-800'
          }`}
        >
          {stepNumber}
        </span>
        <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
          Step {stepNumber} of {totalSteps}
        </h3>
      </div>

      {instruction.instructionText && (
        <div
          className={`prose max-w-none ${isDark ? 'prose-invert text-slate-300' : 'text-slate-600'}`}
          dangerouslySetInnerHTML={{ __html: instruction.instructionText.replace(/\n/g, '<br />') }}
        />
      )}

      {/* Since we don't have the file data right here, we'll assume instruction.fileId exists but not the full file details for downloading. If backend provides file URL it goes here. */}
      {instruction.fileId && (
        <div className="mt-6">
          <a
            href={`/api/drive/files/${instruction.fileId}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isDark
                ? 'bg-white/5 hover:bg-white/10 text-slate-300'
                : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 shadow-sm'
            }`}
          >
            <Paperclip className="w-4 h-4" />
            View Attached File
          </a>
        </div>
      )}
    </div>
  );
}
