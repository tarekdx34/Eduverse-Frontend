import { Mic, Check, Clock, FileText, Download } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

export function VoiceContent() {
  const { isDark } = useTheme();

  return (
    <div className="space-y-6">
      <div className={`${isDark ? 'bg-pink-500/10 border-pink-500/20' : 'bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200'} rounded-xl p-6 border text-center`}>
        <div className={`w-20 h-20 ${isDark ? 'bg-white/5' : 'bg-white'} rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-4`}>
          <Mic className="w-10 h-10 text-pink-600" />
        </div>
        <h4 className={`${isDark ? 'text-white' : 'text-pink-900'} mb-2`}>Voice Recording Studio</h4>
        <p className={`text-sm ${isDark ? 'text-pink-400' : 'text-pink-700'} mb-4`}>
          Record lectures or notes and get instant transcription
        </p>
        <div className={`inline-flex items-center gap-2 text-xs text-pink-700 ${isDark ? 'bg-white/5' : 'bg-white'} px-4 py-2 rounded-lg`}>
          <Check className="w-3 h-3" />
          <span>Supports 50+ languages with 95% accuracy</span>
        </div>
      </div>

      <div className={`${isDark ? 'bg-card-dark border-white/5' : 'border-2 border-slate-100 bg-gradient-to-b from-white to-background-light'} rounded-xl p-8 text-center`}>
        <div className="mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl cursor-pointer hover:scale-105 transition-transform">
            <Mic className="w-12 h-12 text-white" />
          </div>
          <p className={`${isDark ? 'text-white' : 'text-slate-800'} mb-1`}>Ready to Record</p>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Click the microphone to start</p>
        </div>

        <div className={`flex items-center justify-center gap-4 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-6`}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Good connection</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>Max: 2 hours</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
          <button className="px-4 py-3 bg-gradient-to-r from-pink-600 to-pink-700 text-white rounded-lg hover:shadow-lg transition-all">
            Start Recording
          </button>
          <button className={`px-4 py-3 border-2 ${isDark ? 'border-white/10 text-slate-300 hover:bg-white/5' : 'border-slate-100 text-slate-700 hover:bg-slate-50'} rounded-lg transition-all`}>
            Upload Audio
          </button>
        </div>
      </div>

      <div className={`${isDark ? 'bg-card-dark border-white/5' : 'bg-background-light border-slate-100'} rounded-xl p-5 border`}>
        <h5 className={`${isDark ? 'text-white' : 'text-slate-800'} mb-3 flex items-center gap-2`}>
          <FileText className="w-4 h-4" />
          Transcription Preview
        </h5>
        <div className={`${isDark ? 'bg-white/5 border-white/5 text-slate-400' : 'bg-white border-slate-100 text-slate-500'} rounded-lg p-4 border min-h-32 text-sm italic`}>
          Your transcribed text will appear here in real-time...
        </div>
        <div className="flex gap-2 mt-3">
          <button className={`flex-1 px-4 py-2 border-2 ${isDark ? 'border-white/10 text-slate-300 hover:bg-white/5' : 'border-slate-100 text-slate-700 hover:bg-slate-50'} rounded-lg transition-all flex items-center justify-center gap-2`}>
            <Download className="w-4 h-4" />
            Download
          </button>
          <button className={`flex-1 px-4 py-2 border-2 ${isDark ? 'border-white/10 text-slate-300 hover:bg-white/5' : 'border-slate-100 text-slate-700 hover:bg-slate-50'} rounded-lg transition-all`}>
            Copy Text
          </button>
        </div>
      </div>
    </div>
  );
}
