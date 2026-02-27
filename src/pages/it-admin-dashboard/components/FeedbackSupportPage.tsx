import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import {
  HeadphonesIcon,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertTriangle,
  Filter,
  Send,
  ChevronDown,
  ChevronUp,
  Search,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

type Priority = 'low' | 'medium' | 'high' | 'critical';
type Status = 'open' | 'in-progress' | 'resolved';

interface Ticket {
  id: string;
  subject: string;
  submittedBy: string;
  category: string;
  priority: Priority;
  status: Status;
  date: string;
  description: string;
}

// ─── Static Data ─────────────────────────────────────────────────────────────

const tickets: Ticket[] = [
  { id: 'TK-001', subject: 'Cannot access course materials', submittedBy: 'Sara Mohamed', category: 'Technical', priority: 'high', status: 'open', date: '2025-01-15', description: 'I cannot download any PDF files from the course materials section.' },
  { id: 'TK-002', subject: 'Grade display error', submittedBy: 'Omar Ali', category: 'Bug Report', priority: 'critical', status: 'in-progress', date: '2025-01-14', description: 'My grades are showing incorrectly in the gradebook.' },
  { id: 'TK-003', subject: 'Request for new feature', submittedBy: 'Dr. Ahmed Hassan', category: 'Feature Request', priority: 'low', status: 'resolved', date: '2025-01-13', description: 'Can we add a dark mode toggle to the notification settings?' },
  { id: 'TK-004', subject: 'Login issues on mobile', submittedBy: 'Fatima Nour', category: 'Technical', priority: 'medium', status: 'open', date: '2025-01-12', description: 'Cannot login from mobile browser, always redirects to error page.' },
  { id: 'TK-005', subject: 'Slow page loading', submittedBy: 'Hassan Youssef', category: 'Performance', priority: 'high', status: 'in-progress', date: '2025-01-11', description: 'Dashboard takes over 10 seconds to load.' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const priorityConfig: Record<Priority, { label: string; bg: string; text: string }> = {
  critical: { label: 'Critical', bg: 'bg-red-500/15', text: 'text-red-500' },
  high:     { label: 'High',     bg: 'bg-orange-500/15', text: 'text-orange-500' },
  medium:   { label: 'Medium',   bg: 'bg-yellow-500/15', text: 'text-yellow-500' },
  low:      { label: 'Low',      bg: 'bg-green-500/15', text: 'text-green-500' },
};

const statusConfig: Record<Status, { label: string; bg: string; text: string }> = {
  open:          { label: 'Open',        bg: 'bg-blue-500/15', text: 'text-blue-500' },
  'in-progress': { label: 'In Progress', bg: 'bg-yellow-500/15', text: 'text-yellow-500' },
  resolved:      { label: 'Resolved',    bg: 'bg-green-500/15', text: 'text-green-500' },
};

// ─── Component ───────────────────────────────────────────────────────────────

export function FeedbackSupportPage() {
  const { isDark } = useTheme();
  const { t } = useLanguage();

  const [statusFilter, setStatusFilter] = useState<'all' | Status>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | Priority>('all');
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTickets = tickets.filter((ticket) => {
    if (statusFilter !== 'all' && ticket.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && ticket.priority !== priorityFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        ticket.id.toLowerCase().includes(q) ||
        ticket.subject.toLowerCase().includes(q) ||
        ticket.submittedBy.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const openCount = tickets.filter((t) => t.status === 'open').length;
  const inProgressCount = tickets.filter((t) => t.status === 'in-progress').length;
  const resolvedCount = tickets.filter((t) => t.status === 'resolved').length;

  const cardClass = isDark
    ? 'bg-[#1e293b]/80 border border-white/5'
    : 'bg-white border border-slate-200 shadow-sm';
  const headingClass = isDark ? 'text-white' : 'text-slate-900';
  const labelClass = isDark ? 'text-slate-300' : 'text-slate-600';
  const inputClass = isDark
    ? 'bg-[#0f172a] border-white/10 text-white placeholder-slate-500'
    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400';

  const handleToggleExpand = (id: string) => {
    setExpandedTicket(expandedTicket === id ? null : id);
  };

  const handleReply = (ticketId: string) => {
    if (replyText[ticketId]?.trim()) {
      setReplyText((prev) => ({ ...prev, [ticketId]: '' }));
    }
  };

  // ─── Overview Cards ────────────────────────────────────────────────────────

  const overviewCards = [
    { title: 'Open Tickets', value: openCount, icon: MessageSquare, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
    { title: 'In Progress', value: inProgressCount, icon: Clock, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
    { title: 'Resolved', value: resolvedCount, icon: CheckCircle, color: 'text-green-500', bgColor: 'bg-green-500/10' },
    { title: 'Avg Response Time', value: '2.4h', icon: HeadphonesIcon, color: 'text-[#0891B2]', bgColor: 'bg-[#0891B2]/10' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-[#0891B2]/10">
          <HeadphonesIcon className="w-6 h-6 text-[#0891B2]" />
        </div>
        <div>
          <h1 className={`text-2xl font-bold ${headingClass}`}>
            {t('feedbackSupport') || 'Feedback & Support'}
          </h1>
          <p className={labelClass}>
            {t('feedbackSupportDesc') || 'Manage support tickets and user feedback'}
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewCards.map((card) => (
          <div key={card.title} className={`${cardClass} rounded-xl p-5`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${labelClass}`}>{card.title}</p>
                <p className={`text-2xl font-bold mt-1 ${headingClass}`}>{card.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${card.bgColor}`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className={`${cardClass} rounded-xl p-5`}>
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="flex items-center gap-2">
            <Filter className={`w-4 h-4 ${labelClass}`} />
            <span className={`text-sm font-medium ${labelClass}`}>Filters:</span>
          </div>

          {/* Search */}
          <div className="relative flex-1 min-w-0 w-full md:w-auto">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${labelClass}`} />
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-3 py-2 rounded-lg border text-sm ${inputClass} focus:outline-none focus:ring-2 focus:ring-[#0891B2]/40`}
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | Status)}
            className={`px-3 py-2 rounded-lg border text-sm ${inputClass} focus:outline-none focus:ring-2 focus:ring-[#0891B2]/40`}
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as 'all' | Priority)}
            className={`px-3 py-2 rounded-lg border text-sm ${inputClass} focus:outline-none focus:ring-2 focus:ring-[#0891B2]/40`}
          >
            <option value="all">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Tickets Table */}
      <div className={`${cardClass} rounded-xl overflow-hidden`}>
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={isDark ? 'bg-white/5' : 'bg-slate-50'}>
                {['ID', 'Subject', 'Submitted By', 'Category', 'Priority', 'Status', 'Date', ''].map(
                  (header) => (
                    <th
                      key={header}
                      className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${labelClass}`}
                    >
                      {header}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-slate-100'}`}>
              {filteredTickets.map((ticket) => (
                <React.Fragment key={ticket.id}>
                  <tr
                    className={`cursor-pointer transition-colors ${
                      isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'
                    } ${expandedTicket === ticket.id ? (isDark ? 'bg-white/5' : 'bg-slate-50') : ''}`}
                    onClick={() => handleToggleExpand(ticket.id)}
                  >
                    <td className={`px-4 py-3 text-sm font-mono font-medium ${headingClass}`}>
                      {ticket.id}
                    </td>
                    <td className={`px-4 py-3 text-sm ${headingClass}`}>{ticket.subject}</td>
                    <td className={`px-4 py-3 text-sm ${labelClass}`}>{ticket.submittedBy}</td>
                    <td className={`px-4 py-3 text-sm ${labelClass}`}>{ticket.category}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${priorityConfig[ticket.priority].bg} ${priorityConfig[ticket.priority].text}`}
                      >
                        {priorityConfig[ticket.priority].label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[ticket.status].bg} ${statusConfig[ticket.status].text}`}
                      >
                        {statusConfig[ticket.status].label}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-sm ${labelClass}`}>{ticket.date}</td>
                    <td className="px-4 py-3">
                      {expandedTicket === ticket.id ? (
                        <ChevronUp className={`w-4 h-4 ${labelClass}`} />
                      ) : (
                        <ChevronDown className={`w-4 h-4 ${labelClass}`} />
                      )}
                    </td>
                  </tr>
                  {expandedTicket === ticket.id && (
                    <tr>
                      <td colSpan={8} className="px-4 py-4">
                        <TicketDetails
                          ticket={ticket}
                          isDark={isDark}
                          headingClass={headingClass}
                          labelClass={labelClass}
                          inputClass={inputClass}
                          replyText={replyText[ticket.id] || ''}
                          onReplyChange={(val) =>
                            setReplyText((prev) => ({ ...prev, [ticket.id]: val }))
                          }
                          onSendReply={() => handleReply(ticket.id)}
                        />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-white/5">
          {filteredTickets.map((ticket) => (
            <div key={ticket.id} className="p-4">
              <div
                className="flex items-start justify-between cursor-pointer"
                onClick={() => handleToggleExpand(ticket.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-mono font-medium ${headingClass}`}>
                      {ticket.id}
                    </span>
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${priorityConfig[ticket.priority].bg} ${priorityConfig[ticket.priority].text}`}
                    >
                      {priorityConfig[ticket.priority].label}
                    </span>
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[ticket.status].bg} ${statusConfig[ticket.status].text}`}
                    >
                      {statusConfig[ticket.status].label}
                    </span>
                  </div>
                  <p className={`text-sm font-medium ${headingClass} truncate`}>
                    {ticket.subject}
                  </p>
                  <p className={`text-xs mt-1 ${labelClass}`}>
                    {ticket.submittedBy} · {ticket.category} · {ticket.date}
                  </p>
                </div>
                {expandedTicket === ticket.id ? (
                  <ChevronUp className={`w-4 h-4 ml-2 flex-shrink-0 ${labelClass}`} />
                ) : (
                  <ChevronDown className={`w-4 h-4 ml-2 flex-shrink-0 ${labelClass}`} />
                )}
              </div>
              {expandedTicket === ticket.id && (
                <div className="mt-3">
                  <TicketDetails
                    ticket={ticket}
                    isDark={isDark}
                    headingClass={headingClass}
                    labelClass={labelClass}
                    inputClass={inputClass}
                    replyText={replyText[ticket.id] || ''}
                    onReplyChange={(val) =>
                      setReplyText((prev) => ({ ...prev, [ticket.id]: val }))
                    }
                    onSendReply={() => handleReply(ticket.id)}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredTickets.length === 0 && (
          <div className="py-12 text-center">
            <AlertTriangle className={`w-8 h-8 mx-auto mb-2 ${labelClass}`} />
            <p className={`text-sm ${labelClass}`}>No tickets found matching your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Ticket Details Sub-component ────────────────────────────────────────────

function TicketDetails({
  ticket,
  isDark,
  headingClass,
  labelClass,
  inputClass,
  replyText,
  onReplyChange,
  onSendReply,
}: {
  ticket: Ticket;
  isDark: boolean;
  headingClass: string;
  labelClass: string;
  inputClass: string;
  replyText: string;
  onReplyChange: (val: string) => void;
  onSendReply: () => void;
}) {
  return (
    <div
      className={`rounded-lg p-4 ${isDark ? 'bg-[#0f172a]/60 border border-white/5' : 'bg-slate-50 border border-slate-100'}`}
    >
      <div className="mb-3">
        <h4 className={`text-sm font-semibold mb-1 ${headingClass}`}>Description</h4>
        <p className={`text-sm ${labelClass}`}>{ticket.description}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div>
          <p className={`text-xs ${labelClass} mb-0.5`}>Category</p>
          <p className={`text-sm font-medium ${headingClass}`}>{ticket.category}</p>
        </div>
        <div>
          <p className={`text-xs ${labelClass} mb-0.5`}>Priority</p>
          <span
            className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${priorityConfig[ticket.priority].bg} ${priorityConfig[ticket.priority].text}`}
          >
            {priorityConfig[ticket.priority].label}
          </span>
        </div>
        <div>
          <p className={`text-xs ${labelClass} mb-0.5`}>Status</p>
          <span
            className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[ticket.status].bg} ${statusConfig[ticket.status].text}`}
          >
            {statusConfig[ticket.status].label}
          </span>
        </div>
        <div>
          <p className={`text-xs ${labelClass} mb-0.5`}>Submitted</p>
          <p className={`text-sm font-medium ${headingClass}`}>{ticket.date}</p>
        </div>
      </div>

      {/* Reply Form */}
      <div className={`border-t pt-3 ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
        <label className={`text-xs font-semibold ${labelClass} mb-1 block`}>Reply</label>
        <div className="flex gap-2">
          <textarea
            value={replyText}
            onChange={(e) => onReplyChange(e.target.value)}
            placeholder="Type your reply..."
            rows={2}
            className={`flex-1 px-3 py-2 rounded-lg border text-sm resize-none ${inputClass} focus:outline-none focus:ring-2 focus:ring-[#0891B2]/40`}
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSendReply();
            }}
            disabled={!replyText.trim()}
            className="self-end px-4 py-2 rounded-lg bg-[#0891B2] text-white text-sm font-medium hover:bg-[#0891B2]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <Send className="w-4 h-4" />
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
