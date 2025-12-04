import { Mic, Check, Clock, FileText, Download } from 'lucide-react';

export function VoiceContent() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-6 border border-pink-200 text-center">
        <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-4">
          <Mic className="w-10 h-10 text-pink-600" />
        </div>
        <h4 className="text-pink-900 mb-2">Voice Recording Studio</h4>
        <p className="text-sm text-pink-700 mb-4">
          Record lectures or notes and get instant transcription
        </p>
        <div className="inline-flex items-center gap-2 text-xs text-pink-700 bg-white px-4 py-2 rounded-lg">
          <Check className="w-3 h-3" />
          <span>Supports 50+ languages with 95% accuracy</span>
        </div>
      </div>

      <div className="border-2 border-gray-200 rounded-xl p-8 text-center bg-gradient-to-b from-white to-gray-50">
        <div className="mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl cursor-pointer hover:scale-105 transition-transform">
            <Mic className="w-12 h-12 text-white" />
          </div>
          <p className="text-gray-900 mb-1">Ready to Record</p>
          <p className="text-sm text-gray-600">Click the microphone to start</p>
        </div>

        <div className="flex items-center justify-center gap-4 text-sm text-gray-600 mb-6">
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
          <button className="px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all">
            Upload Audio
          </button>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
        <h5 className="text-gray-900 mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Transcription Preview
        </h5>
        <div className="bg-white rounded-lg p-4 border border-gray-200 min-h-32 text-sm text-gray-500 italic">
          Your transcribed text will appear here in real-time...
        </div>
        <div className="flex gap-2 mt-3">
          <button className="flex-1 px-4 py-2 border-2 border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
            <Download className="w-4 h-4" />
            Download
          </button>
          <button className="flex-1 px-4 py-2 border-2 border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all">
            Copy Text
          </button>
        </div>
      </div>
    </div>
  );
}
