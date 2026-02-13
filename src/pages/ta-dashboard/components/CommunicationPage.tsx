import React, { useState } from 'react';
import { MessageSquare, Send, Flag, CheckCircle, Clock, User } from 'lucide-react';

type Message = {
  id: string;
  from: string;
  subject: string;
  message: string;
  timestamp: string;
  read: boolean;
};

type Question = {
  id: string;
  studentName: string;
  course: string;
  lab: string;
  question: string;
  timestamp: string;
  status: 'new' | 'answered' | 'flagged';
  answer?: string;
};

type CommunicationPageProps = {
  messages: Message[];
  questions: Question[];
};

export function CommunicationPage({ messages: initialMessages, questions: initialQuestions }: CommunicationPageProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [questions, setQuestions] = useState(initialQuestions);
  const [activeTab, setActiveTab] = useState<'messages' | 'qa'>('messages');

  const unreadCount = messages.filter((m) => !m.read).length;
  const unansweredCount = questions.filter((q) => q.status === 'new').length;

  const handleMarkAsRead = (messageId: string) => {
    setMessages(messages.map((m) => (m.id === messageId ? { ...m, read: true } : m)));
  };

  const handleAnswerQuestion = (questionId: string) => {
    setQuestions(
      questions.map((q) => (q.id === questionId ? { ...q, status: 'answered' as const, answer: 'Answered' } : q))
    );
  };

  const handleFlagQuestion = (questionId: string) => {
    setQuestions(questions.map((q) => (q.id === questionId ? { ...q, status: 'flagged' as const } : q)));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Communication</h2>
        <p className="text-gray-600 mt-1">Manage messages, Q&A discussions, and reminders</p>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-gray-200 rounded-lg p-1 flex gap-2">
        <button
          onClick={() => setActiveTab('messages')}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'messages'
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          Messages {unreadCount > 0 && <span className="ml-2">({unreadCount})</span>}
        </button>
        <button
          onClick={() => setActiveTab('qa')}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'qa' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          Q&A Discussions {unansweredCount > 0 && <span className="ml-2">({unansweredCount})</span>}
        </button>
      </div>

      {/* Messages Tab */}
      {activeTab === 'messages' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Messages</h3>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2">
              <Send className="w-4 h-4" />
              New Message
            </button>
          </div>

          <div className="space-y-2">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`bg-white border rounded-lg p-4 cursor-pointer transition-colors ${
                  message.read ? 'border-gray-200' : 'border-blue-200 bg-blue-50'
                }`}
                onClick={() => handleMarkAsRead(message.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{message.from}</p>
                      <p className="text-sm text-gray-600">{message.subject}</p>
                    </div>
                  </div>
                  {!message.read && (
                    <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  )}
                </div>
                <p className="text-sm text-gray-700 mb-2">{message.message}</p>
                <p className="text-xs text-gray-500">{new Date(message.timestamp).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Q&A Tab */}
      {activeTab === 'qa' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Q&A Discussions</h3>
            <div className="flex gap-2">
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                Filter
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {questions.map((question) => (
              <div
                key={question.id}
                className="bg-white border border-gray-200 rounded-lg p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <User className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{question.studentName}</p>
                        <p className="text-xs text-gray-600">
                          {question.course} • {question.lab}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-900 mb-2">{question.question}</p>
                    {question.answer && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-gray-900">
                          <span className="font-semibold">Your Answer: </span>
                          {question.answer}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {question.status === 'new' && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-medium">
                        New
                      </span>
                    )}
                    {question.status === 'answered' && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                        Answered
                      </span>
                    )}
                    {question.status === 'flagged' && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
                        Flagged
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4">
                  {question.status === 'new' && (
                    <>
                      <button
                        onClick={() => handleAnswerQuestion(question.id)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Answer
                      </button>
                      <button
                        onClick={() => handleFlagQuestion(question.id)}
                        className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                      >
                        <Flag className="w-4 h-4" />
                        Flag for Instructor
                      </button>
                    </>
                  )}
                  <span className="text-xs text-gray-500 ml-auto">
                    {new Date(question.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default CommunicationPage;
