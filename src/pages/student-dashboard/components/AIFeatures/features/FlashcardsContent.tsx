import { useState } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { 
  Sparkles, 
  Layers, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  Check, 
  X,
  Plus,
  Upload,
  BookOpen,
  Brain,
  Shuffle,
  Download,
  Share2
} from 'lucide-react';

interface Flashcard {
  id: number;
  front: string;
  back: string;
  category: string;
  mastered: boolean;
}

export function FlashcardsContent() {
  const { isDark } = useTheme();
  const [mode, setMode] = useState<'create' | 'study'>('create');
  const [inputText, setInputText] = useState('');
  const [topic, setTopic] = useState('');
  const [cardCount, setCardCount] = useState('10');
  const [isGenerating, setIsGenerating] = useState(false);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  // Sample generated flashcards for demo
  const sampleFlashcards: Flashcard[] = [
    { id: 1, front: 'What is a Binary Search Tree?', back: 'A binary tree where for each node, all elements in the left subtree are less than the node, and all elements in the right subtree are greater.', category: 'Data Structures', mastered: false },
    { id: 2, front: 'What is the time complexity of QuickSort (average)?', back: 'O(n log n) - It divides the array and recursively sorts the partitions.', category: 'Algorithms', mastered: false },
    { id: 3, front: 'What is a Hash Table?', back: 'A data structure that maps keys to values using a hash function for O(1) average-case lookup.', category: 'Data Structures', mastered: true },
    { id: 4, front: 'What is Dynamic Programming?', back: 'An optimization technique that solves complex problems by breaking them into overlapping subproblems and storing their solutions.', category: 'Algorithms', mastered: false },
    { id: 5, front: 'What is the difference between Stack and Queue?', back: 'Stack: LIFO (Last In First Out). Queue: FIFO (First In First Out).', category: 'Data Structures', mastered: false },
  ];

  const handleGenerate = () => {
    if (!topic.trim()) return;
    setIsGenerating(true);
    // Simulate AI generation
    setTimeout(() => {
      setFlashcards(sampleFlashcards);
      setIsGenerating(false);
      setMode('study');
    }, 2000);
  };

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
      setShowAnswer(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
      setShowAnswer(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    setShowAnswer(!showAnswer);
  };

  const handleMarkMastered = (mastered: boolean) => {
    const updated = [...flashcards];
    updated[currentIndex].mastered = mastered;
    setFlashcards(updated);
    if (currentIndex < flashcards.length - 1) {
      handleNext();
    }
  };

  const handleShuffle = () => {
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    setFlashcards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const masteredCount = flashcards.filter(f => f.mastered).length;
  const progress = flashcards.length > 0 ? (masteredCount / flashcards.length) * 100 : 0;

  if (mode === 'study' && flashcards.length > 0) {
    const currentCard = flashcards[currentIndex];
    
    return (
      <div className="space-y-5">
        {/* Progress Header */}
        <div className={`${isDark ? 'bg-teal-500/10 border-teal-500/20' : 'bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200'} rounded-xl p-4 border`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-teal-600" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-teal-900'}`}>Studying: {topic || 'Flashcards'}</span>
            </div>
            <button 
              onClick={() => setMode('create')}
              className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              New Deck
            </button>
          </div>
          <div className={`flex items-center gap-4 text-sm ${isDark ? 'text-teal-400' : 'text-teal-700'}`}>
            <span>Card {currentIndex + 1} of {flashcards.length}</span>
            <span>•</span>
            <span>{masteredCount} mastered</span>
          </div>
          <div className={`mt-3 w-full ${isDark ? 'bg-white/10' : 'bg-teal-200'} rounded-full h-2`}>
            <div 
              className="bg-gradient-to-r from-teal-500 to-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Flashcard */}
        <div 
          onClick={handleFlip}
          className={`relative min-h-[280px] cursor-pointer perspective-1000`}
        >
          <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
            {/* Front */}
            <div className={`absolute inset-0 ${isDark ? 'bg-card-dark border-white/10' : 'bg-white border-2 border-slate-100'} rounded-2xl p-8 flex flex-col items-center justify-center shadow-lg ${isFlipped ? 'opacity-0' : 'opacity-100'}`}>
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-medium">
                  {currentCard.category}
                </span>
              </div>
              {currentCard.mastered && (
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
                    <Check className="w-3 h-3" /> Mastered
                  </span>
                </div>
              )}
              <BookOpen className="w-10 h-10 text-teal-300 mb-4" />
              <p className={`text-xl ${isDark ? 'text-white' : 'text-slate-800'} text-center font-medium`}>{currentCard.front}</p>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'} mt-6`}>Click to reveal answer</p>
            </div>

            {/* Back */}
            <div className={`absolute inset-0 bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl p-8 flex flex-col items-center justify-center shadow-lg text-white ${isFlipped ? 'opacity-100' : 'opacity-0'}`}>
              <Brain className="w-10 h-10 text-teal-200 mb-4" />
              <p className="text-lg text-center leading-relaxed">{currentCard.back}</p>
              <p className="text-sm text-teal-200 mt-6">Click to see question</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`flex items-center gap-2 px-4 py-2 border-2 ${isDark ? 'border-white/10 hover:bg-white/5' : 'border-slate-100 hover:bg-slate-50'} rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all`}
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleMarkMastered(false)}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 border-2 border-red-200 text-red-700 rounded-lg hover:bg-red-100 transition-all"
            >
              <X className="w-5 h-5" />
              Still Learning
            </button>
            <button
              onClick={() => handleMarkMastered(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-50 border-2 border-green-200 text-green-700 rounded-lg hover:bg-green-100 transition-all"
            >
              <Check className="w-5 h-5" />
              Got It!
            </button>
          </div>

          <button
            onClick={handleNext}
            disabled={currentIndex === flashcards.length - 1}
            className={`flex items-center gap-2 px-4 py-2 border-2 ${isDark ? 'border-white/10 hover:bg-white/5' : 'border-slate-100 hover:bg-slate-50'} rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all`}
          >
            Next
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className={`grid grid-cols-4 gap-3 pt-4 border-t ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
          <button
            onClick={handleShuffle}
            className={`flex items-center justify-center gap-2 px-4 py-3 border-2 ${isDark ? 'border-white/10 hover:bg-white/5' : 'border-slate-100 hover:bg-slate-50'} rounded-lg transition-all`}
          >
            <Shuffle className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`} />
            <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Shuffle</span>
          </button>
          <button
            onClick={() => { setCurrentIndex(0); setIsFlipped(false); }}
            className={`flex items-center justify-center gap-2 px-4 py-3 border-2 ${isDark ? 'border-white/10 hover:bg-white/5' : 'border-slate-100 hover:bg-slate-50'} rounded-lg transition-all`}
          >
            <RotateCcw className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`} />
            <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Restart</span>
          </button>
          <button className={`flex items-center justify-center gap-2 px-4 py-3 border-2 ${isDark ? 'border-white/10 hover:bg-white/5' : 'border-slate-100 hover:bg-slate-50'} rounded-lg transition-all`}>
            <Download className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`} />
            <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Export</span>
          </button>
          <button className={`flex items-center justify-center gap-2 px-4 py-3 border-2 ${isDark ? 'border-white/10 hover:bg-white/5' : 'border-slate-100 hover:bg-slate-50'} rounded-lg transition-all`}>
            <Share2 className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`} />
            <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Share</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className={`${isDark ? 'bg-teal-500/10 border-teal-500/20' : 'bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200'} rounded-xl p-6 border`}>
        <h4 className={`${isDark ? 'text-white' : 'text-teal-900'} mb-2 flex items-center gap-2`}>
          <Sparkles className="w-4 h-4" />
          AI-Powered Flashcard Generator
        </h4>
        <p className={`text-sm ${isDark ? 'text-teal-400' : 'text-teal-700'}`}>
          Transform your study materials into effective flashcards for better memorization
        </p>
      </div>

      <div>
        <label className={`block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-3`}>Topic or Subject</label>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter topic (e.g., Data Structures, React Hooks, SQL Queries)"
          className={`w-full px-4 py-3 ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-slate-500' : 'border-2 border-slate-100'} rounded-lg focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100 transition-all`}
        />
      </div>

      <div>
        <label className={`block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-3`}>
          Paste your study material (optional)
        </label>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste lecture notes, textbook content, or any study material here..."
          rows={5}
          className={`w-full px-4 py-3 ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-slate-500' : 'border-2 border-slate-100'} rounded-lg focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100 transition-all resize-none`}
        />
      </div>

      <div className="flex items-center gap-4">
        <label className={`flex-1 flex items-center justify-center gap-3 px-4 py-4 border-2 border-dashed ${isDark ? 'border-white/20 hover:border-teal-400 hover:bg-teal-500/10' : 'border-slate-200 hover:border-teal-400 hover:bg-teal-50'} rounded-xl transition-all cursor-pointer`}>
          <Upload className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
          <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Upload PDF or Document</span>
          <input type="file" className="hidden" accept=".pdf,.doc,.docx,.txt" />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-2`}>Number of Cards</label>
          <select 
            value={cardCount}
            onChange={(e) => setCardCount(e.target.value)}
            className={`w-full px-4 py-3 ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-slate-500' : 'border-2 border-slate-100'} rounded-lg focus:outline-none focus:border-teal-500 transition-all`}
          >
            <option value="5">5 Cards</option>
            <option value="10">10 Cards</option>
            <option value="15">15 Cards</option>
            <option value="20">20 Cards</option>
            <option value="30">30 Cards</option>
          </select>
        </div>
        <div>
          <label className={`block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-2`}>Card Style</label>
          <select className={`w-full px-4 py-3 ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-slate-500' : 'border-2 border-slate-100'} rounded-lg focus:outline-none focus:border-teal-500 transition-all`}>
            <option>Question & Answer</option>
            <option>Term & Definition</option>
            <option>Concept & Example</option>
          </select>
        </div>
      </div>

      <button 
        onClick={handleGenerate}
        disabled={!topic.trim() || isGenerating}
        className="w-full px-6 py-4 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isGenerating ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Generating Flashcards...
          </>
        ) : (
          <>
            <Layers className="w-5 h-5" />
            Generate Flashcards
          </>
        )}
      </button>

      {/* Recent Decks */}
      <div className={`pt-4 border-t ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
        <h4 className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-3`}>Recent Flashcard Decks</h4>
        <div className="space-y-2">
          {[
            { name: 'Data Structures Basics', cards: 15, mastered: 12 },
            { name: 'React Hooks', cards: 10, mastered: 8 },
            { name: 'SQL Queries', cards: 20, mastered: 15 },
          ].map((deck, idx) => (
            <button
              key={idx}
              onClick={() => {
                setFlashcards(sampleFlashcards);
                setTopic(deck.name);
                setMode('study');
              }}
              className={`w-full flex items-center justify-between p-3 border ${isDark ? 'border-white/10 hover:bg-white/5' : 'border-slate-100 hover:bg-slate-50'} rounded-lg transition-all`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                  <Layers className="w-5 h-5 text-teal-600" />
                </div>
                <div className="text-left">
                  <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{deck.name}</p>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{deck.cards} cards • {deck.mastered} mastered</p>
                </div>
              </div>
              <ChevronRight className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
