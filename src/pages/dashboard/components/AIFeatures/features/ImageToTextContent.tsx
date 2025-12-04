import { ImageIcon as ImageIconComponent, Check, Zap } from 'lucide-react';

export function ImageToTextContent() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-6 border border-teal-200">
        <h4 className="text-teal-900 mb-2 flex items-center gap-2">
          <ImageIconComponent className="w-4 h-4" />
          Advanced OCR Technology
        </h4>
        <p className="text-sm text-teal-700">
          Extract text from any image with 99% accuracy
        </p>
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center hover:border-teal-500 transition-all cursor-pointer group bg-gradient-to-b from-white to-gray-50">
        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 group-hover:shadow-md transition-shadow">
          <ImageIconComponent className="w-8 h-8 text-teal-600" />
        </div>
        <h4 className="text-gray-900 mb-2">Upload Image or Screenshot</h4>
        <p className="text-sm text-gray-600 mb-4">
          Drop files here or click to select
        </p>
        <div className="inline-flex items-center gap-2 text-xs text-teal-700 bg-white px-4 py-2 rounded-lg">
          <Check className="w-3 h-3" />
          <span>JPG, PNG, PDF, HEIC (Max 25MB)</span>
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-700 mb-3">Processing Options</label>
        <div className="grid grid-cols-2 gap-3">
          {[
            'Auto-detect language',
            'Preserve formatting',
            'Remove background',
            'Enhance quality'
          ].map((option, idx) => (
            <label key={idx} className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-all">
              <input 
                type="checkbox" 
                className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500" 
                defaultChecked={idx === 0}
              />
              <span className="text-sm text-gray-700">{option}</span>
            </label>
          ))}
        </div>
      </div>

      <button className="w-full px-6 py-4 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2">
        <Zap className="w-5 h-5" />
        Extract Text Now
      </button>

      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <h5 className="text-gray-900 mb-2 text-sm">Quick Tips:</h5>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Ensure good lighting for better accuracy</li>
          <li>• Avoid blurry or rotated images</li>
          <li>• Works great with printed and handwritten text</li>
        </ul>
      </div>
    </div>
  );
}
