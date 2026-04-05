import React from 'react';
import { FileText, GripVertical, Edit2, Trash2, ExternalLink } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { LabInstruction } from '../types';

interface InstructionCardProps {
  instruction: LabInstruction;
  index: number;
  showActions?: boolean;
  onEdit?: (instruction: LabInstruction) => void;
  onDelete?: (instruction: LabInstruction) => void;
  draggable?: boolean;
}

export function InstructionCard({
  instruction,
  index,
  showActions = false,
  onEdit,
  onDelete,
  draggable = false,
}: InstructionCardProps) {
  const { isDark } = useTheme();
  
  return (
    <div
      className={`flex gap-3 p-4 rounded-lg border transition-colors ${
        isDark 
          ? 'bg-white/5 border-white/10 hover:bg-white/10' 
          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
      }`}
    >
      {/* Drag handle (if draggable) */}
      {draggable && (
        <div className={`cursor-grab ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
          <GripVertical className="w-5 h-5" />
        </div>
      )}
      
      {/* Step number */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
          isDark 
            ? 'bg-blue-500/20 text-blue-400' 
            : 'bg-blue-100 text-blue-700'
        }`}
      >
        {index + 1}
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        {instruction.instructionText && (
          <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
            {instruction.instructionText}
          </p>
        )}
        
        {/* File attachment */}
        {instruction.file && (
          <a
            href={instruction.file.webViewLink || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 mt-2 text-sm px-3 py-1.5 rounded-lg transition-colors ${
              isDark
                ? 'bg-white/10 text-blue-400 hover:bg-white/20'
                : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span className="truncate max-w-[200px]">{instruction.file.fileName}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
      
      {/* Actions */}
      {showActions && (
        <div className="flex items-start gap-1">
          {onEdit && (
            <button
              onClick={() => onEdit(instruction)}
              className={`p-2 rounded-lg transition-colors ${
                isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-gray-200 text-gray-500'
              }`}
              aria-label="Edit instruction"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(instruction)}
              className={`p-2 rounded-lg transition-colors text-red-500 ${
                isDark ? 'hover:bg-red-500/20' : 'hover:bg-red-50'
              }`}
              aria-label="Delete instruction"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default InstructionCard;
