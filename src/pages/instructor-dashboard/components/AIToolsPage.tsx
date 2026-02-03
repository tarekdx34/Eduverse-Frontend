import React, { useState } from 'react';
import {
  Sparkles,
  Brain,
  FileText,
  Upload,
  BarChart3,
  Calendar,
  Wand2,
  AlertTriangle,
  TrendingDown,
  Users,
  Mic,
  Image,
  MessageSquare,
} from 'lucide-react';
import {
  VoiceRecorder,
  ImageTextExtractor,
  AIQuestionEditor,
  AIChatbot,
  Question,
} from '../../../components/shared';

export function AIToolsPage() {
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium');
  const [activeAITool, setActiveAITool] = useState<string | null>(null);
  const [showChatbot, setShowChatbot] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([
    {
      id: '1',
      type: 'multiple-choice',
      question: 'What is the derivative of x²?',
      options: ['x', '2x', 'x²', '2x²'],
      correctAnswer: 1,
      points: 2,
      difficulty: 'easy',
      explanation: 'The power rule states that d/dx(xⁿ) = nxⁿ⁻¹',
    },
    {
      id: '2',
      type: 'true-false',
      question: 'The integral of a constant is always zero.',
      correctAnswer: 'false',
      points: 1,
      difficulty: 'easy',
      explanation: 'The integral of a constant c is cx + C',
    },
    {
      id: '3',
      type: 'short-answer',
      question: 'Explain the chain rule in your own words.',
      points: 5,
      difficulty: 'hard',
    },
  ]);

  const handleVoiceTranscription = (text: string) => {
    console.log('Transcribed text:', text);
    // Use the transcribed text for content creation
  };

  const handleImageTextExtracted = (text: string) => {
    console.log('Extracted text:', text);
    // Use the extracted text for quiz generation or content
  };

  const handleQuestionsChange = (questions: Question[]) => {
    setGeneratedQuestions(questions);
  };

  const generateMoreQuestions = async (difficulty: string, count: number): Promise<Question[]> => {
    // Simulate AI generation
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    const newQuestions: Question[] = [];
    for (let i = 0; i < count; i++) {
      newQuestions.push({
        id: `gen-${Date.now()}-${i}`,
        type: 'multiple-choice',
        question: `Generated question ${i + 1} (${difficulty} difficulty)`,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: Math.floor(Math.random() * 4),
        points: difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3,
        difficulty: difficulty as 'easy' | 'medium' | 'hard',
      });
    }
    return newQuestions;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Tools</h1>
          <p className="text-gray-600 mt-1">
            Use AI to enhance teaching, grade automatically, generate quizzes, create materials, and
            detect student issues.
          </p>
        </div>

        {/* AI Tools Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI Quiz Generator */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Brain className="text-blue-600" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">AI Quiz Generator</h3>
                <p className="text-sm text-gray-600">
                  Generate MCQs, True/False, and short-answer questions.
                </p>
              </div>
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Difficulty Level
              </label>
              <div className="flex gap-2">
                {['easy', 'medium', 'hard'].map((level) => (
                  <button
                    key={level}
                    onClick={() => setSelectedDifficulty(level)}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                      selectedDifficulty === level
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                <Sparkles size={18} />
                Generate Quiz
              </button>
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200">
                <Upload size={16} />
                Generate from Lecture File
              </button>
            </div>
          </div>

          {/* AI Auto-Grading */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Sparkles className="text-purple-600" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">AI Auto-Grading (Evy)</h3>
                <p className="text-sm text-gray-600">
                  Automatically grade submissions, detect plagiarism, and create feedback.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 mb-4">
              <div className="flex items-center justify-center">
                <div className="p-4 bg-purple-100 rounded-full">
                  <Sparkles className="text-purple-600" size={48} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                <Sparkles size={18} />
                Auto-Grade All
              </button>
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-purple-700 hover:bg-purple-100 rounded-lg transition-colors border border-purple-200">
                <FileText size={16} />
                Generate Feedback
              </button>
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-red-200">
                <AlertTriangle size={16} />
                Analyze Submissions
              </button>
            </div>
          </div>

          {/* Lecture Materials Generator */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <FileText className="text-green-600" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Lecture Materials Generator</h3>
                <p className="text-sm text-gray-600">
                  Upload a file or type a topic to generate lecture slides, summaries, examples, or
                  explanations.
                </p>
              </div>
            </div>

            <div className="mb-4">
              <input
                type="text"
                placeholder="Enter topic or upload a file..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              />
            </div>

            <div className="space-y-2">
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                <Upload size={16} />
                Upload Material
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button className="flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200">
                  <FileText size={14} />
                  Generate Slides
                </button>
                <button className="flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200">
                  <Wand2 size={14} />
                  Generate Summary
                </button>
              </div>
            </div>
          </div>

          {/* AI Insights for Teaching */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <BarChart3 className="text-purple-600" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">AI Insights for Teaching</h3>
                <p className="text-sm text-gray-600">
                  Identify struggling students, weak topics, and performance patterns.
                </p>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <AlertTriangle className="text-yellow-600" size={16} />
                <span className="text-sm text-gray-700">
                  Students struggled with Derivatives last week.
                </span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
                <TrendingDown className="text-red-600" size={16} />
                <span className="text-sm text-gray-700">Engagement dropped in Physics labs.</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
                <Users className="text-orange-600" size={16} />
                <span className="text-sm text-gray-700">
                  30% of students are at risk of poor performance.
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm">
                View Details
              </button>
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-purple-700 hover:bg-purple-50 rounded-lg transition-colors border border-purple-200">
                <Sparkles size={16} />
                Send Tips
              </button>
            </div>
          </div>

          {/* Smart Teaching Plan */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Calendar className="text-orange-600" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Smart Teaching Plan</h3>
                <p className="text-sm text-gray-600">
                  Generate a personalized weekly teaching plan based on analytics.
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm font-medium text-gray-900 mb-2">This Week's Plan</p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-orange-600">•</span>
                  <span>Review derivatives concepts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600">•</span>
                  <span>Extra practice session for struggling students</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600">•</span>
                  <span>Lab session focused on applications</span>
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm">
                <Sparkles size={16} />
                Generate Plan
              </button>
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200">
                View Activities
              </button>
            </div>
          </div>

          {/* Improve My Materials */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-pink-100 rounded-lg">
                <Wand2 className="text-pink-600" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Improve My Materials</h3>
                <p className="text-sm text-gray-600">
                  Upload your existing lecture or quiz and let the AI refine it.
                </p>
              </div>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-4 text-center">
              <Upload className="mx-auto text-gray-400 mb-2" size={32} />
              <p className="text-sm text-gray-600 mb-1">Upload lecture or quiz materials</p>
              <p className="text-xs text-gray-500">PDF, DOC, PPT</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button className="flex items-center justify-center gap-2 px-3 py-2 text-sm text-pink-700 hover:bg-pink-50 rounded-lg transition-colors border border-pink-200">
                <Sparkles size={14} />
                Improve Difficulty
              </button>
              <button className="flex items-center justify-center gap-2 px-3 py-2 text-sm text-pink-700 hover:bg-pink-50 rounded-lg transition-colors border border-pink-200">
                <Wand2 size={14} />
                Fix Language
              </button>
            </div>
          </div>
        </div>

        {/* Voice to Text Tool */}
        <div className="mt-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Voice to Text</h3>
          <VoiceRecorder
            onTranscription={handleVoiceTranscription}
            showTranscription={true}
            autoTranscribe={true}
          />
        </div>

        {/* Image to Text Tool */}
        <div className="mt-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Image to Text (OCR)</h3>
          <ImageTextExtractor onTextExtracted={handleImageTextExtracted} />
        </div>

        {/* AI Question Editor */}
        <div className="mt-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">AI Question Editor</h3>
          <AIQuestionEditor
            questions={generatedQuestions}
            onQuestionsChange={handleQuestionsChange}
            onGenerateMore={generateMoreQuestions}
          />
        </div>

        {/* Floating AI Chatbot Button */}
        <button
          onClick={() => setShowChatbot(true)}
          className="fixed bottom-6 right-6 p-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 z-40"
        >
          <MessageSquare size={24} />
        </button>

        {/* AI Chatbot */}
        <AIChatbot
          isOpen={showChatbot}
          onClose={() => setShowChatbot(false)}
          userRole="instructor"
          userName="Professor"
        />
      </div>
    </div>
  );
}

export default AIToolsPage;
