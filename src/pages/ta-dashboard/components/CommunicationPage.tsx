import React, { useState } from 'react';
import { Send, Flag, CheckCircle, User } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { NewMessageModal } from './NewMessageModal';

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
  onMarkAsRead: (messageId: string) => void;
  onAnswerQuestion: (questionId: string, answer?: string) => void;
  onFlagQuestion: (questionId: string) => void;
  onNewMessage?: (subject: string, message: string) => void;
};

export function CommunicationPage({
  messages,
  questions,
  onMarkAsRead,
  onAnswerQuestion,
  onFlagQuestion,
  onNewMessage,
}: CommunicationPageProps) {
  const [activeTab, setActiveTab] = useState<'messages' | 'qa'>('messages');
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const cardCls = isDark ? 'bg-gray-800 border-gray-700 shadow-sm' : 'bg-white border-gray-200 shadow-sm';
  const textCls = isDark ? 'text-gray-100' : 'text-gray-900';
  const mutedCls = isDark ? 'text-gray-400' : 'text-gray-600';
  const btnPrimaryCls = isDark ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white';
  const tabInactiveCls = isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100';
  const messageUnreadCls = isDark ? 'border-indigo-600 bg-indigo-900/20' : 'border-indigo-200 bg-indigo-50';
  const avatarCls = isDark ? 'bg-indigo-900/50' : 'bg-indigo-100';
  const answerBoxCls = isDark ? 'bg-indigo-900/20 border-indigo-700' : 'bg-indigo-50 border-indigo-200';

  const unreadCount = messages.filter((m) => !m.read).length;
  const unansweredCount = questions.filter((q) => q.status === 'new').length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className={`text-2xl font-bold ${textCls}`}>{t('communicationTitle')}</h2>
        <p className={`${mutedCls} mt-1`}>{t('manageMessagesQA')}</p>
      </div>

      <div className={`${cardCls} border rounded-lg p-1 flex gap-2`}>
        <button
          onClick={() => setActiveTab('messages')}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'messages' ? btnPrimaryCls : tabInactiveCls
          }`}
        >
          {t('messages')} {unreadCount > 0 && <span className="ml-2">({unreadCount})</span>}
        </button>
        <button
          onClick={() => setActiveTab('qa')}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'qa' ? btnPrimaryCls : tabInactiveCls
          }`}
        >
          {t('qaDiscussions')} {unansweredCount > 0 && <span className="ml-2">({unansweredCount})</span>}
        </button>
      </div>

      {activeTab === 'messages' && (
        <div className="space-y-4">
          {showNewMessageModal && onNewMessage && (
            <NewMessageModal
              onClose={() => setShowNewMessageModal(false)}
              onSend={(subject, message) => {
                onNewMessage(subject, message);
                setShowNewMessageModal(false);
              }}
            />
          )}
          <div className="flex items-center justify-between">
            <h3 className={`text-lg font-semibold ${textCls}`}>{t('messages')}</h3>
            <button
              onClick={() => onNewMessage && setShowNewMessageModal(true)}
              className={`${btnPrimaryCls} px-4 py-2 rounded-lg transition-colors text-sm font-medium flex items-center gap-2`}
            >
              <Send className="w-4 h-4" />
              {t('newMessage')}
            </button>
          </div>

          <div className="space-y-2">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`${cardCls} border rounded-lg p-4 cursor-pointer transition-colors ${
                  message.read ? '' : messageUnreadCls
                }`}
                onClick={() => onMarkAsRead(message.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${avatarCls} flex items-center justify-center`}>
                      <User className={isDark ? 'w-4 h-4 text-indigo-400' : 'w-4 h-4 text-indigo-600'} />
                    </div>
                    <div>
                      <p className={`font-semibold ${textCls}`}>{message.from}</p>
                      <p className={`text-sm ${mutedCls}`}>{message.subject}</p>
                    </div>
                  </div>
                  {!message.read && (
                    <span className={`w-2 h-2 rounded-full ${isDark ? 'bg-indigo-400' : 'bg-indigo-600'}`}></span>
                  )}
                </div>
                <p className={`text-sm ${mutedCls} mb-2`}>{message.message}</p>
                <p className={`text-xs ${mutedCls}`}>{new Date(message.timestamp).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'qa' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className={`text-lg font-semibold ${textCls}`}>{t('qaDiscussions')}</h3>
            <div className="flex gap-2">
              <button className={`px-4 py-2 border rounded-lg text-sm font-medium ${isDark ? 'border-gray-600 hover:bg-gray-700 text-gray-300' : 'border-gray-300 hover:bg-gray-50 text-gray-700'}`}>
                {t('filter')}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {questions.map((question) => (
              <div key={question.id} className={`${cardCls} border rounded-lg p-6`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? 'bg-green-900/30' : 'bg-green-100'}`}>
                        <User className={isDark ? 'w-4 h-4 text-green-400' : 'w-4 h-4 text-green-600'} />
                      </div>
                      <div>
                        <p className={`font-semibold ${textCls}`}>{question.studentName}</p>
                        <p className={`text-xs ${mutedCls}`}>
                          {question.course} • {question.lab}
                        </p>
                      </div>
                    </div>
                    <p className={`${textCls} mb-2`}>{question.question}</p>
                    {question.answer && (
                      <div className={`mt-3 p-3 ${answerBoxCls} border rounded-lg`}>
                        <p className={`text-sm ${textCls}`}>
                          <span className="font-semibold">{t('yourAnswer')}: </span>
                          {question.answer}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {question.status === 'new' && (
                      <span className={`px-2 py-1 rounded text-xs font-medium ${isDark ? 'bg-orange-900/50 text-orange-300' : 'bg-orange-100 text-orange-800'}`}>
                        New
                      </span>
                    )}
                    {question.status === 'answered' && (
                      <span className={`px-2 py-1 rounded text-xs font-medium ${isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-800'}`}>
                        Answered
                      </span>
                    )}
                    {question.status === 'flagged' && (
                      <span className={`px-2 py-1 rounded text-xs font-medium ${isDark ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-800'}`}>
                        Flagged
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4">
                  {question.status === 'new' && (
                    <>
                      <button
                        onClick={() => onAnswerQuestion(question.id)}
                        className={`flex items-center gap-2 ${btnPrimaryCls} px-4 py-2 rounded-lg transition-colors text-sm font-medium`}
                      >
                        <CheckCircle className="w-4 h-4" />
                        {t('answer')}
                      </button>
                      <button
                        onClick={() => onFlagQuestion(question.id)}
                        className={`flex items-center gap-2 border rounded-lg text-sm font-medium px-4 py-2 transition-colors ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                      >
                        <Flag className="w-4 h-4" />
                        {t('flagForInstructor')}
                      </button>
                    </>
                  )}
                  <span className={`text-xs ${mutedCls} ml-auto`}>
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
