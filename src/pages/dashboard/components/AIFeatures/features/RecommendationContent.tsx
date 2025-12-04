import { Lightbulb, Sparkles, Clock, Settings } from 'lucide-react';

export function RecommendationContent() {
  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6 border border-amber-200">
        <h4 className="text-amber-900 mb-2 flex items-center gap-2">
          <Lightbulb className="w-4 h-4" />
          Personalized for Your Success
        </h4>
        <p className="text-sm text-amber-700">
          Based on your learning patterns, interests, and academic goals
        </p>
      </div>

      <div>
        <h5 className="text-gray-900 mb-3 flex items-center justify-between">
          <span>Top Recommendations</span>
          <span className="text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded-full">AI Matched</span>
        </h5>
        <div className="space-y-3">
          {[
            { title: 'Advanced JavaScript Concepts', match: 95, type: 'Course', time: '6 weeks' },
            { title: 'React Design Patterns', match: 92, type: 'Tutorial', time: '4 hours' },
            { title: 'System Design Fundamentals', match: 88, type: 'Course', time: '8 weeks' },
            { title: 'Data Structures Masterclass', match: 85, type: 'Course', time: '10 weeks' }
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl p-4 border-2 border-gray-200 hover:border-amber-500 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h6 className="text-gray-900 mb-1 group-hover:text-amber-700 transition-colors">
                    {item.title}
                  </h6>
                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    <span className="bg-gray-100 px-2 py-1 rounded">{item.type}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {item.time}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg text-amber-600">{item.match}%</div>
                  <div className="text-xs text-gray-500">match</div>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-amber-500 to-amber-600 h-2 rounded-full transition-all"
                  style={{ width: `${item.match}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button className="w-full px-6 py-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2">
        <Sparkles className="w-5 h-5" />
        Discover More Recommendations
      </button>

      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
          <Settings className="w-4 h-4" />
          <span>Customize Preferences</span>
        </div>
        <p className="text-xs text-gray-600">
          Fine-tune your recommendations by updating your learning goals and interests
        </p>
      </div>
    </div>
  );
}
