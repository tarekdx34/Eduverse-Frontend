import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  DollarSign,
  CreditCard,
  TrendingUp,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Filter,
  Eye,
  RefreshCw,
  Edit2,
  CheckCircle,
  XCircle,
  Clock,
  Building,
} from 'lucide-react';

const revenueChartData = [
  { month: 'Sep', revenue: 22000 },
  { month: 'Oct', revenue: 25000 },
  { month: 'Nov', revenue: 24000 },
  { month: 'Dec', revenue: 28000 },
  { month: 'Jan', revenue: 26000 },
  { month: 'Feb', revenue: 28000 },
];

const transactions = [
  {
    id: 'TXN-001',
    student: 'Mohamed Ali',
    amount: 500,
    type: 'Tuition',
    method: 'Credit Card',
    status: 'Completed',
    date: 'Feb 25, 2025',
  },
  {
    id: 'TXN-002',
    student: 'Sara Ibrahim',
    amount: 150,
    type: 'Course Fee',
    method: 'Bank Transfer',
    status: 'Completed',
    date: 'Feb 24, 2025',
  },
  {
    id: 'TXN-003',
    student: 'Ahmed Youssef',
    amount: 500,
    type: 'Tuition',
    method: 'Credit Card',
    status: 'Pending',
    date: 'Feb 24, 2025',
  },
  {
    id: 'TXN-004',
    student: 'Fatima Ahmed',
    amount: 75,
    type: 'Lab Fee',
    method: 'PayPal',
    status: 'Completed',
    date: 'Feb 23, 2025',
  },
  {
    id: 'TXN-005',
    student: 'Omar Hassan',
    amount: 500,
    type: 'Tuition',
    method: 'Credit Card',
    status: 'Refunded',
    date: 'Feb 22, 2025',
  },
  {
    id: 'TXN-006',
    student: 'Layla Mohamed',
    amount: 200,
    type: 'Subscription',
    method: 'Bank Transfer',
    status: 'Completed',
    date: 'Feb 21, 2025',
  },
  {
    id: 'TXN-007',
    student: 'Khaled Mansour',
    amount: 500,
    type: 'Tuition',
    method: 'Credit Card',
    status: 'Failed',
    date: 'Feb 20, 2025',
  },
  {
    id: 'TXN-008',
    student: 'Nour El-Din',
    amount: 150,
    type: 'Course Fee',
    method: 'PayPal',
    status: 'Completed',
    date: 'Feb 19, 2025',
  },
];

const subscriptionPlans = [
  {
    name: 'Basic Plan',
    price: '$9.99/mo',
    subscribers: 2100,
    features: ['5 courses', 'Basic analytics', 'Email support'],
  },
  {
    name: 'Pro Plan',
    price: '$19.99/mo',
    subscribers: 1950,
    features: ['Unlimited courses', 'Advanced analytics', 'Priority support', 'AI tools'],
  },
  {
    name: 'Enterprise',
    price: '$49.99/mo',
    subscribers: 800,
    features: ['All Pro features', 'Custom branding', 'API access', 'Dedicated support'],
  },
];

const paymentMethods = [
  { name: 'Credit Card', fee: '2.9%', transactions: 3200, enabled: true },
  { name: 'Bank Transfer', fee: '1.5%', transactions: 1100, enabled: true },
  { name: 'PayPal', fee: '3.5%', transactions: 850, enabled: true },
  { name: 'Cryptocurrency', fee: '1.0%', transactions: 50, enabled: false },
];

type Tab = 'overview' | 'transactions' | 'subscriptions';

export function PaymentManagementPage() {
  const { isDark, primaryHex } = useTheme() as any;
  const accentColor = primaryHex || '#3b82f6';
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);
  const [methodToggles, setMethodToggles] = useState(
    paymentMethods.reduce(
      (acc, m) => ({ ...acc, [m.name]: m.enabled }),
      {} as Record<string, boolean>
    )
  );

  const cardClass = `rounded-xl border shadow-sm p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`;
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const inputClass = `w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    isDark
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
  }`;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return isDark ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-700';
      case 'Pending':
        return isDark ? 'bg-yellow-500/20 text-yellow-300' : 'bg-yellow-100 text-yellow-700';
      case 'Refunded':
        return isDark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700';
      case 'Failed':
        return isDark ? 'bg-red-500/20 text-red-300' : 'bg-red-100 text-red-700';
      default:
        return isDark ? 'bg-gray-500/20 text-gray-300' : 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle size={14} />;
      case 'Pending':
        return <Clock size={14} />;
      case 'Refunded':
        return <RefreshCw size={14} />;
      case 'Failed':
        return <XCircle size={14} />;
      default:
        return null;
    }
  };

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || tx.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'transactions', label: 'Transactions' },
    { key: 'subscriptions', label: 'Subscriptions' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${textPrimary}`}>Payment Management</h1>
          <p className={`text-sm mt-1 ${textSecondary}`}>
            Manage payments, subscriptions, and revenue
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className={`flex gap-1 p-1 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? ''
                : isDark
                  ? 'text-gray-400 hover:text-white'
                  : 'text-gray-600 hover:text-gray-900'
            }`}
            style={
              activeTab === tab.key ? { backgroundColor: accentColor, color: 'white' } : undefined
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Revenue Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={cardClass}>
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <DollarSign size={20} className="text-green-500" />
                </div>
                <span className="flex items-center gap-1 text-xs text-green-500">
                  <ArrowUpRight size={14} />
                  +12%
                </span>
              </div>
              <p className={`text-2xl font-bold mt-3 ${textPrimary}`}>$245,600</p>
              <p className={`text-sm ${textSecondary}`}>Total Revenue</p>
            </div>
            <div className={cardClass}>
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <TrendingUp size={20} className="text-blue-500" />
                </div>
                <span className="flex items-center gap-1 text-xs text-blue-500">
                  <ArrowUpRight size={14} />
                  +5%
                </span>
              </div>
              <p className={`text-2xl font-bold mt-3 ${textPrimary}`}>$28,400</p>
              <p className={`text-sm ${textSecondary}`}>Monthly Revenue</p>
            </div>
            <div className={cardClass}>
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Users size={20} className="text-blue-500" />
                </div>
              </div>
              <p className={`text-2xl font-bold mt-3 ${textPrimary}`}>4,850</p>
              <p className={`text-sm ${textSecondary}`}>Active Subscriptions</p>
            </div>
            <div className={cardClass}>
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <Clock size={20} className="text-yellow-500" />
                </div>
              </div>
              <p className={`text-2xl font-bold mt-3 ${textPrimary}`}>8</p>
              <p className={`text-sm ${textSecondary}`}>Pending Refunds</p>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className={cardClass}>
            <h2 className={`text-lg font-semibold mb-4 ${textPrimary}`}>Revenue Overview</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                  <XAxis dataKey="month" stroke={isDark ? '#9ca3af' : '#6b7280'} />
                  <YAxis
                    stroke={isDark ? '#9ca3af' : '#6b7280'}
                    tickFormatter={(v) => `$${v / 1000}K`}
                  />
                  <Tooltip
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                    contentStyle={{
                      backgroundColor: isDark ? '#1f2937' : '#ffffff',
                      border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                      borderRadius: '8px',
                      color: isDark ? '#ffffff' : '#111827',
                    }}
                  />
                  <Bar dataKey="revenue" fill={accentColor} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className={cardClass}>
            <h2 className={`text-lg font-semibold mb-4 ${textPrimary}`}>Recent Transactions</h2>
            <div className="space-y-3">
              {transactions.slice(0, 5).map((tx) => (
                <div
                  key={tx.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}>
                      <DollarSign size={16} className={textSecondary} />
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${textPrimary}`}>{tx.student}</p>
                      <p className={`text-xs ${textSecondary}`}>{tx.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className={`text-sm font-semibold ${textPrimary}`}>${tx.amount}</p>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(tx.status)}`}
                    >
                      {getStatusIcon(tx.status)}
                      {tx.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className={cardClass}>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search
                    className={`absolute left-3 top-1/2 -translate-y-1/2 ${textSecondary}`}
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Filter size={18} className={textSecondary} />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={inputClass}
                >
                  <option value="all">All Status</option>
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                  <option value="Refunded">Refunded</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>
              <input type="date" className={inputClass} style={{ width: 'auto' }} />
              <input type="date" className={inputClass} style={{ width: 'auto' }} />
            </div>
          </div>

          {/* Transaction Table */}
          <div className={cardClass}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    {['ID', 'Student', 'Amount', 'Type', 'Method', 'Status', 'Date', 'Actions'].map(
                      (h) => (
                        <th key={h} className={`text-left py-3 px-4 font-medium ${textSecondary}`}>
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((tx) => (
                    <tr
                      key={tx.id}
                      onClick={() =>
                        setSelectedTransaction(selectedTransaction === tx.id ? null : tx.id)
                      }
                      className={`border-b cursor-pointer transition-colors ${
                        isDark
                          ? 'border-gray-700 hover:bg-gray-700/50'
                          : 'border-gray-100 hover:bg-gray-50'
                      } ${selectedTransaction === tx.id ? (isDark ? 'bg-gray-700/50' : 'bg-blue-50') : ''}`}
                    >
                      <td className={`py-3 px-4 font-mono text-xs ${textSecondary}`}>{tx.id}</td>
                      <td className={`py-3 px-4 font-medium ${textPrimary}`}>{tx.student}</td>
                      <td className={`py-3 px-4 font-semibold ${textPrimary}`}>${tx.amount}</td>
                      <td className={`py-3 px-4 ${textSecondary}`}>{tx.type}</td>
                      <td className={`py-3 px-4 ${textSecondary}`}>
                        <span className="flex items-center gap-1">
                          <CreditCard size={14} />
                          {tx.method}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(tx.status)}`}
                        >
                          {getStatusIcon(tx.status)}
                          {tx.status}
                        </span>
                      </td>
                      <td className={`py-3 px-4 ${textSecondary}`}>{tx.date}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            className={`p-1 rounded hover:bg-gray-200 ${isDark ? 'hover:bg-gray-600' : ''}`}
                            title="View Details"
                          >
                            <Eye size={16} className={textSecondary} />
                          </button>
                          {tx.status === 'Completed' && (
                            <button className="px-2 py-1 text-xs hover:opacity-90 text-white rounded-md transition-colors">
                              Process Refund
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Subscriptions Tab */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-6">
          {/* Subscription Plans */}
          <div>
            <h2 className={`text-lg font-semibold mb-4 ${textPrimary}`}>Subscription Plans</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {subscriptionPlans.map((plan) => (
                <div key={plan.name} className={cardClass}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-lg font-semibold ${textPrimary}`}>{plan.name}</h3>
                    <Building size={20} className="text-blue-500" />
                  </div>
                  <p className="text-2xl font-bold text-blue-500 mb-1">{plan.price}</p>
                  <p className={`text-sm mb-4 ${textSecondary}`}>
                    {plan.subscribers.toLocaleString()} subscribers
                  </p>
                  <ul className="space-y-2 mb-4">
                    {plan.features.map((f) => (
                      <li key={f} className={`flex items-center gap-2 text-sm ${textSecondary}`}>
                        <CheckCircle size={14} className="text-green-500" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button className="w-full flex items-center justify-center gap-2 px-4 py-2 hover:opacity-90 text-white rounded-lg transition-colors">
                    <Edit2 size={16} />
                    Edit Plan
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Methods */}
          <div>
            <h2 className={`text-lg font-semibold mb-4 ${textPrimary}`}>Payment Methods</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paymentMethods.map((method) => (
                <div key={method.name} className={cardClass}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <CreditCard size={20} className="text-blue-500" />
                      </div>
                      <div>
                        <p className={`font-medium ${textPrimary}`}>{method.name}</p>
                        <p className={`text-xs ${textSecondary}`}>
                          {method.fee} fee &middot; {method.transactions.toLocaleString()}{' '}
                          transactions
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        setMethodToggles((prev) => ({ ...prev, [method.name]: !prev[method.name] }))
                      }
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        methodToggles[method.name]
                          ? ''
                          : isDark
                            ? 'bg-gray-600'
                            : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          methodToggles[method.name] ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <div className="mt-2 text-right">
                    <span
                      className={`text-xs font-medium ${methodToggles[method.name] ? 'text-green-500' : 'text-gray-500'}`}
                    >
                      {methodToggles[method.name] ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
