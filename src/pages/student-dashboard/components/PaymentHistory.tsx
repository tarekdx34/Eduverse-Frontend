import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Eye, Download, FileText } from 'lucide-react';

interface PaymentRecord {
  id: string;
  category: string;
  date: string;
  status: 'On-Verification' | 'Completed' | 'Pending' | 'Failed';
  amount?: string;
}

interface PaymentHistoryProps {
  payments?: PaymentRecord[];
}

const getStatusColor = (status: string, isDark: boolean) => {
  const colors = {
    'On-Verification': isDark ? 'bg-yellow-900/50 text-yellow-400' : 'bg-yellow-50 text-yellow-700',
    'Completed': isDark ? 'bg-green-900/50 text-green-400' : 'bg-green-50 text-green-700',
    'Pending': isDark ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-50 text-blue-700',
    'Failed': isDark ? 'bg-red-900/50 text-red-400' : 'bg-red-50 text-red-700',
  };
  return colors[status as keyof typeof colors] || colors['On-Verification'];
};

const allPayments: PaymentRecord[] = [
  {
    id: 'PID - 331829',
    category: '6th Semester Tuition',
    date: '23 October 2024',
    status: 'On-Verification',
    amount: '$4,500.00',
  },
  {
    id: 'PID - 331828',
    category: '5th Semester Tuition',
    date: '15 March 2024',
    status: 'Completed',
    amount: '$4,500.00',
  },
  {
    id: 'PID - 331827',
    category: 'Lab Fees',
    date: '10 March 2024',
    status: 'Completed',
    amount: '$350.00',
  },
  {
    id: 'PID - 331826',
    category: '4th Semester Tuition',
    date: '20 September 2023',
    status: 'Completed',
    amount: '$4,250.00',
  },
];

export default function PaymentHistory({ payments = allPayments.slice(0, 1) }: PaymentHistoryProps) {
  const { isDark } = useTheme();
  const [showAll, setShowAll] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);

  const displayedPayments = showAll ? allPayments : payments;

  const handleDownloadReceipt = (payment: PaymentRecord) => {
    alert(`Downloading receipt for ${payment.id}...`);
  };

  return (
    <div className={`mt-6 rounded-lg p-6 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Payment & Tuition History</h2>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Complete data about your payment and tuition history</p>
        </div>
        <button 
          onClick={() => setShowAll(!showAll)}
          className="text-purple-600 text-sm font-medium hover:text-purple-700 transition-colors"
        >
          {showAll ? 'Show Less' : 'View All Payment'}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <tr>
              <th className={`text-left py-3 px-4 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Payment ID</th>
              <th className={`text-left py-3 px-4 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Payment Category</th>
              <th className={`text-left py-3 px-4 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Date</th>
              <th className={`text-left py-3 px-4 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Amount</th>
              <th className={`text-left py-3 px-4 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Payment Status</th>
              <th className={`text-left py-3 px-4 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedPayments.map((payment) => (
              <tr key={payment.id} className={`border-b transition-colors ${isDark ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-100 hover:bg-gray-50'}`}>
                <td className={`py-4 px-4 ${isDark ? 'text-gray-300' : ''}`}>{payment.id}</td>
                <td className={`py-4 px-4 ${isDark ? 'text-gray-300' : ''}`}>{payment.category}</td>
                <td className={`py-4 px-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{payment.date}</td>
                <td className={`py-4 px-4 font-medium ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>{payment.amount}</td>
                <td className="py-4 px-4">
                  <span className={`inline-block px-3 py-1 text-xs font-medium rounded ${getStatusColor(payment.status, isDark)}`}>{payment.status}</span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedPayment(payment)}
                      className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                      title="View Details"
                    >
                      <Eye className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    </button>
                    {payment.status === 'Completed' && (
                      <button
                        onClick={() => handleDownloadReceipt(payment)}
                        className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                        title="Download Receipt"
                      >
                        <Download className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Payment Detail Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-md rounded-xl overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`p-4 border-b flex items-center justify-between ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center gap-2">
                <FileText className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Payment Details</h3>
              </div>
              <button
                onClick={() => setSelectedPayment(null)}
                className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
              >
                ×
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex justify-between">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Payment ID</span>
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedPayment.id}</span>
              </div>
              <div className="flex justify-between">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Category</span>
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedPayment.category}</span>
              </div>
              <div className="flex justify-between">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Date</span>
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedPayment.date}</span>
              </div>
              <div className="flex justify-between">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Amount</span>
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedPayment.amount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Status</span>
                <span className={`px-3 py-1 text-xs font-medium rounded ${getStatusColor(selectedPayment.status, isDark)}`}>
                  {selectedPayment.status}
                </span>
              </div>
            </div>

            <div className={`p-4 border-t flex justify-end gap-3 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <button
                onClick={() => setSelectedPayment(null)}
                className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                Close
              </button>
              {selectedPayment.status === 'Completed' && (
                <button
                  onClick={() => handleDownloadReceipt(selectedPayment)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  <Download size={16} />
                  Download Receipt
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
