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
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

export function AIToolsPage() {
  const { isDark } = useTheme();
  const { isRTL } = useLanguage();
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

  const cardClass = isDark
    ? 'bg-card-dark border border-white/5'
    : 'glass';

  return (
    <div className={`min-h-screen p-6 ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 via-indigo-500 to-cyan-400 bg-clip-text text-transparent">
            AI Teaching Toolbox
          </h1>
          <p className={`mt-2 text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Use AI to enhance teaching, grade automatically, generate quizzes, create materials, and
            detect student issues.
          </p>
        </div>

        {/* Main Tools Grid - 4 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Quiz Generator */}
          <div className={`${cardClass} p-8 rounded-[2.5rem] transition-all duration-300 hover:scale-[1.02]`}>
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mb-4">
                <Brain className="text-blue-600" size={28} />
              </div>
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Quiz Generator</h3>
              <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Generate MCQs, True/False, and short-answer questions.
              </p>
            </div>

            <div className="mb-4">
              <label className={`text-sm font-medium mb-2 block ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Difficulty Level
              </label>
              <div className="flex gap-2">
                {['easy', 'medium', 'hard'].map((level) => (
                  <button
                    key={level}
                    onClick={() => setSelectedDifficulty(level)}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium transition-colors ${
                      selectedDifficulty === level
                        ? 'bg-blue-600 text-white'
                        : isDark
                          ? 'bg-white/5 text-gray-300 hover:bg-white/10'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium">
                <Sparkles size={16} />
                Generate Quiz
              </button>
              <button className={`w-full flex items-center justify-center gap-2 px-4 py-2 text-sm rounded-xl transition-colors border ${
                isDark ? 'border-white/10 text-gray-300 hover:bg-white/5' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}>
                <Upload size={14} />
                From Lecture File
              </button>
            </div>
          </div>

          {/* Auto-Grading (Evy) */}
          <div className={`${cardClass} p-8 rounded-[2.5rem] transition-all duration-300 hover:scale-[1.02]`}>
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-14 h-14 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center mb-4">
                <Sparkles className="text-purple-600" size={28} />
              </div>
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Auto-Grading (Evy)</h3>
              <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Automatically grade submissions, detect plagiarism, and create feedback.
              </p>
            </div>

            <div className="space-y-2">
              <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors text-sm font-medium">
                <Sparkles size={16} />
                Auto-Grade All
              </button>
              <button className={`w-full flex items-center justify-center gap-2 px-4 py-2 text-sm rounded-xl transition-colors border ${
                isDark ? 'border-white/10 text-gray-300 hover:bg-white/5' : 'border-purple-200 text-purple-700 hover:bg-purple-50'
              }`}>
                <FileText size={14} />
                Generate Feedback
              </button>
              <button className={`w-full flex items-center justify-center gap-2 px-4 py-2 text-sm rounded-xl transition-colors border ${
                isDark ? 'border-red-800/30 text-red-400 hover:bg-red-900/20' : 'border-red-200 text-red-700 hover:bg-red-50'
              }`}>
                <AlertTriangle size={14} />
                Analyze Submissions
              </button>
            </div>
          </div>

          {/* Materials Generator */}
          <div className={`${cardClass} p-8 rounded-[2.5rem] transition-all duration-300 hover:scale-[1.02]`}>
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center mb-4">
                <FileText className="text-green-600" size={28} />
              </div>
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Materials Generator</h3>
              <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Upload a file or type a topic to generate slides, summaries, and explanations.
              </p>
            </div>

            <div className="mb-4">
              <input
                type="text"
                placeholder="Enter topic..."
                className={`w-full px-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  isDark ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500' : 'border border-gray-300 text-gray-900'
                }`}
              />
            </div>

            <div className="space-y-2">
              <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors text-sm font-medium">
                <Upload size={16} />
                Upload Material
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button className={`flex items-center justify-center gap-1 px-3 py-2 text-xs rounded-xl transition-colors border ${
                  isDark ? 'border-white/10 text-gray-300 hover:bg-white/5' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}>
                  <FileText size={12} />
                  Generate Slides
                </button>
                <button className={`flex items-center justify-center gap-1 px-3 py-2 text-xs rounded-xl transition-colors border ${
                  isDark ? 'border-white/10 text-gray-300 hover:bg-white/5' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}>
                  <Wand2 size={12} />
                  Generate Summary
                </button>
              </div>
            </div>
          </div>

          {/* AI Insights */}
          <div className={`${cardClass} p-8 rounded-[2.5rem] transition-all duration-300 hover:scale-[1.02]`}>
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-14 h-14 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center mb-4">
                <BarChart3 className="text-purple-600" size={28} />
              </div>
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>AI Insights</h3>
              <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Identify struggling students, weak topics, and performance patterns.
              </p>
            </div>

            <div className="space-y-2 mb-4">
              <div className={`flex items-center gap-2 p-2.5 rounded-xl text-xs ${
                isDark ? 'bg-yellow-900/20 border border-yellow-800/30' : 'bg-yellow-50 border border-yellow-200'
              }`}>
                <AlertTriangle className="text-yellow-500 shrink-0" size={14} />
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Students struggled with Derivatives.</span>
              </div>
              <div className={`flex items-center gap-2 p-2.5 rounded-xl text-xs ${
                isDark ? 'bg-red-900/20 border border-red-800/30' : 'bg-red-50 border border-red-200'
              }`}>
                <TrendingDown className="text-red-500 shrink-0" size={14} />
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Engagement dropped in Physics labs.</span>
              </div>
              <div className={`flex items-center gap-2 p-2.5 rounded-xl text-xs ${
                isDark ? 'bg-orange-900/20 border border-orange-800/30' : 'bg-orange-50 border border-orange-200'
              }`}>
                <Users className="text-orange-500 shrink-0" size={14} />
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>30% of students at risk.</span>
              </div>
            </div>

            <div className="space-y-2">
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors text-sm font-medium">
                View Details
              </button>
              <button className={`w-full flex items-center justify-center gap-2 px-4 py-2 text-sm rounded-xl transition-colors border ${
                isDark ? 'border-white/10 text-gray-300 hover:bg-white/5' : 'border-purple-200 text-purple-700 hover:bg-purple-50'
              }`}>
                <Sparkles size={14} />
                Send Tips
              </button>
            </div>
          </div>
        </div>

        {/* Voice & Image Tools Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Voice to Text */}
          <div className={`${cardClass} p-8 rounded-[2.5rem] transition-all duration-300 hover:scale-[1.02]`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                <Mic className="text-blue-600" size={20} />
              </div>
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Voice to Text</h3>
            </div>
            <VoiceRecorder
              onTranscription={handleVoiceTranscription}
              showTranscription={true}
              autoTranscribe={true}
            />
          </div>

          {/* Image to Text (OCR) */}
          <div className={`${cardClass} p-8 rounded-[2.5rem] transition-all duration-300 hover:scale-[1.02]`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                <Image className="text-indigo-600" size={20} />
              </div>
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Image to Text (OCR)</h3>
            </div>
            <ImageTextExtractor onTextExtracted={handleImageTextExtracted} />
          </div>
        </div>

        {/* Smart Teaching Plan - Full Width CTA */}
        <div className={`p-8 rounded-[2.5rem] transition-all duration-300 hover:scale-[1.01] ${
          isDark
            ? 'bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900'
            : 'bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500'
        }`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="text-white/80" size={24} />
                <h3 className="text-2xl font-bold text-white">Smart Teaching Plan</h3>
              </div>
              <p className="text-white/70 text-sm mb-4">
                Generate a personalized weekly teaching plan based on analytics.
              </p>
              <ul className="space-y-2 text-sm text-white/80">
                <li className="flex items-start gap-2">
                  <span className="text-white">•</span>
                  <span>Review derivatives concepts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white">•</span>
                  <span>Extra practice session for struggling students</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white">•</span>
                  <span>Lab session focused on applications</span>
                </li>
              </ul>
            </div>
            <div className="shrink-0">
              <button className="flex items-center gap-2 px-8 py-3 bg-white text-purple-700 rounded-xl font-semibold hover:bg-white/90 transition-colors shadow-lg">
                <Sparkles size={18} />
                Generate Plan
              </button>
            </div>
          </div>
        </div>

        {/* AI Question Editor */}
        <div className={`${cardClass} p-8 rounded-[2.5rem] transition-all duration-300`}>
          <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>AI Question Editor</h3>
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
