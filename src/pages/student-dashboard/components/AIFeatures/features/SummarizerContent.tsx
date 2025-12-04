import { Upload, Check, Clock, Sparkles } from 'lucide-react';

export function SummarizerContent() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-dashed border-blue-300 rounded-xl p-10 text-center hover:border-blue-500 transition-all cursor-pointer group">
        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 group-hover:shadow-md transition-shadow">
          <Upload className="w-8 h-8 text-blue-600" />
        </div>
        <h4 className="text-gray-900 mb-2">Drop Your Document Here</h4>
        <p className="text-sm text-gray-600 mb-4">
          Or click to browse from your device
        </p>
        <div className="inline-flex items-center gap-2 text-xs text-blue-700 bg-white px-4 py-2 rounded-lg">
          <Check className="w-3 h-3" />
          <span>Supports: PDF, DOCX, TXT, MD (Max 10MB)</span>
        </div>
      </div>

      <div className="space-y-3">
        <label className="block text-sm text-gray-700">Summary Length</label>
        <div className="grid grid-cols-3 gap-3">
          {['Brief', 'Standard', 'Detailed'].map(length => (
            <button
              key={length}
              className="px-4 py-3 rounded-lg border-2 border-gray-200 text-gray-700 hover:border-blue-500 hover:bg-blue-50 transition-all"
            >
              {length}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4" />
          Generate Summary
        </button>
        <button className="px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all">
          Clear
        </button>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <Clock className="w-4 h-4" />
          <span>Recent Summaries</span>
        </div>
        <div className="space-y-2">
          <div className="bg-white rounded p-3 text-sm text-gray-700 hover:shadow-sm cursor-pointer transition-shadow">
            Database Systems - Chapter 5.pdf
          </div>
          <div className="bg-white rounded p-3 text-sm text-gray-700 hover:shadow-sm cursor-pointer transition-shadow">
            Machine Learning Notes.docx
          </div>
        </div>
      </div>
    </div>
  );
}
