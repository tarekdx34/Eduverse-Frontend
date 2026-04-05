import React, { useState } from 'react';
import {
  Search,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Clock,
  Filter,
  MoreVertical,
  User,
  Mail,
  ArrowRight,
  MessageCircle,
  Eye,
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { CleanSelect } from '../../../components/shared';

interface SupportTicket {
  id: number;
  user: string;
  subject: string;
  priority: string;
  status: string;
  createdAt: string;
  category: string;
}

interface FeedbackSupportPageProps {
  tickets: SupportTicket[];
  onUpdateTicket: (id: number, status: string) => void;
  onReplyTicket: (id: number, message: string) => void;
}

export function FeedbackSupportPage({
  tickets,
  onUpdateTicket,
  onReplyTicket,
}: FeedbackSupportPageProps) {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState('');

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.user.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'inProgress':
        return 'bg-blue-100 text-blue-700';
      case 'resolved':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock size={14} />;
      case 'inProgress':
        return <AlertCircle size={14} />;
      case 'resolved':
        return <CheckCircle size={14} />;
      default:
        return <Clock size={14} />;
    }
  };

  const stats = {
    total: tickets.length,
    pending: tickets.filter((t) => t.status === 'pending').length,
    inProgress: tickets.filter((t) => t.status === 'inProgress').length,
    resolved: tickets.filter((t) => t.status === 'resolved').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('feedback')}
          </h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('manageFeedbackSub')}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div
          className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-900/50' : 'bg-blue-100'}`}>
              <MessageSquare className="text-blue-600" size={20} />
            </div>
            <div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {stats.total}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('totalTickets')}
              </div>
            </div>
          </div>
        </div>
        <div
          className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-yellow-900/50' : 'bg-yellow-100'}`}>
              <Clock className="text-yellow-600" size={20} />
            </div>
            <div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {stats.pending}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('pending')}
              </div>
            </div>
          </div>
        </div>
        <div
          className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-900/50' : 'bg-blue-100'}`}>
              <AlertCircle className="text-blue-600" size={20} />
            </div>
            <div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {stats.inProgress}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('inProgress')}
              </div>
            </div>
          </div>
        </div>
        <div
          className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-green-900/50' : 'bg-green-100'}`}>
              <CheckCircle className="text-green-600" size={20} />
            </div>
            <div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {stats.resolved}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('resolved')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div
        className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
      >
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search
                className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                size={18}
              />
              <input
                type="text"
                placeholder={t('searchTickets')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}
              />
            </div>
          </div>
          <CleanSelect
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}
          >
            <option value="all">{t('allStatus')}</option>
            <option value="pending">{t('pending')}</option>
            <option value="inProgress">{t('inProgress')}</option>
            <option value="resolved">{t('resolved')}</option>
          </CleanSelect>
          <CleanSelect
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}
          >
            <option value="all">{t('allPriorities')}</option>
            <option value="high">{t('high')}</option>
            <option value="medium">{t('medium')}</option>
            <option value="low">{t('low')}</option>
          </CleanSelect>
        </div>
      </div>

      {/* Tickets List */}
      <div
        className={`rounded-xl border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
      >
        <div className="divide-y divide-gray-200">
          {filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              className={`p-4 flex items-center justify-between cursor-pointer ${isDark ? 'hover:bg-gray-700 divide-gray-700' : 'hover:bg-gray-50'}`}
              onClick={() => setSelectedTicket(ticket)}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-400 to-orange-400 flex items-center justify-center text-white font-semibold">
                  {ticket.user
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
                <div>
                  <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {ticket.subject}
                  </h3>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {ticket.user} • {ticket.createdAt}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                >
                  {ticket.category}
                </span>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(ticket.priority)}`}
                >
                  {ticket.priority}
                </span>
                <span
                  className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getStatusColor(ticket.status)}`}
                >
                  {getStatusIcon(ticket.status)}
                  {ticket.status === 'inProgress'
                    ? t('inProgress')
                    : ticket.status === 'pending'
                      ? t('pending')
                      : t('resolved')}
                </span>
                <ArrowRight size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div
            className={`w-full max-w-2xl rounded-xl overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'}`}
          >
            <div
              className={`p-4 border-b flex items-center justify-between ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
            >
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('ticketId')} #{selectedTicket.id}
              </h3>
              <button
                onClick={() => setSelectedTicket(null)}
                className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                ×
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-400 to-orange-400 flex items-center justify-center text-white font-semibold text-lg">
                  {selectedTicket.user
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
                <div className="flex-1">
                  <h2
                    className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
                  >
                    {selectedTicket.subject}
                  </h2>
                  <div
                    className={`flex items-center gap-4 mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                  >
                    <span className="flex items-center gap-1">
                      <User size={14} />
                      {selectedTicket.user}
                    </span>
                    <span>{selectedTicket.createdAt}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(selectedTicket.priority)}`}
                    >
                      {selectedTicket.priority} priority
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedTicket.status)}`}
                    >
                      {selectedTicket.status}
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                    >
                      {selectedTicket.category}
                    </span>
                  </div>
                </div>
              </div>

              <div className={`p-4 rounded-lg mb-6 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                  This is a sample ticket description. The user has reported an issue that needs
                  attention from the support team.
                </p>
              </div>

              {/* Status Update */}
              <div className="mb-6">
                <label
                  className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  {t('updateStatus')}
                </label>
                <div className="flex gap-2">
                  {['pending', 'inProgress', 'resolved'].map((status) => (
                    <button
                      key={status}
                      onClick={() => onUpdateTicket(selectedTicket.id, status)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                        selectedTicket.status === status
                          ? isDark
                            ? 'bg-red-900/50 border-red-600 text-red-300'
                            : 'bg-red-50 border-red-200 text-red-700'
                          : isDark
                            ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                            : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {getStatusIcon(status)}
                      {status === 'inProgress'
                        ? t('inProgress')
                        : status === 'pending'
                          ? t('pending')
                          : t('resolved')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reply Form */}
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  {t('reply')}
                </label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your response..."
                  rows={4}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}
                />
              </div>
            </div>

            <div
              className={`p-4 border-t flex justify-end gap-3 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
            >
              <button
                onClick={() => setSelectedTicket(null)}
                className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {t('close')}
              </button>
              <button
                onClick={() => {
                  onReplyTicket(selectedTicket.id, replyText);
                  setReplyText('');
                }}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <Mail size={18} />
                {t('sendReply')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FeedbackSupportPage;
