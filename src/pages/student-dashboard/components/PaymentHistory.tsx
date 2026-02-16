import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

interface PaymentRecord {
  id: string;
  category: string;
  date: string;
  status: 'On-Verification' | 'Completed' | 'Pending' | 'Failed';
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

const defaultPayments: PaymentRecord[] = [
  {
    id: 'PID - 331829',
    category: '6th Semester Tuition',
    date: '23 October 2024',
    status: 'On-Verification',
  },
];

export default function PaymentHistory({ payments = defaultPayments }: PaymentHistoryProps) {
  const { isDark } = useTheme();
  const { t } = useLanguage();

  return (
    <div className={`mt-6 rounded-lg p-6 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('paymentTuitionHistory')}</h2>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('paymentHistoryDesc')}</p>
        </div>
        <button className="text-purple-600 text-sm font-medium hover:text-purple-700 transition-colors">{t('viewAllPayment')}</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <tr>
              <th className={`text-left py-3 px-4 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('paymentId')}</th>
              <th className={`text-left py-3 px-4 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('paymentCategory')}</th>
              <th className={`text-left py-3 px-4 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('date')}</th>
              <th className={`text-left py-3 px-4 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('paymentStatus')}</th>
              <th className={`text-left py-3 px-4 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`} />
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id} className={`border-b transition-colors ${isDark ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-100 hover:bg-gray-50'}`}>
                <td className={`py-4 px-4 ${isDark ? 'text-gray-300' : ''}`}>{payment.id}</td>
                <td className={`py-4 px-4 ${isDark ? 'text-gray-300' : ''}`}>{payment.category}</td>
                <td className={`py-4 px-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{payment.date}</td>
                <td className="py-4 px-4">
                  <span className={`inline-block px-3 py-1 text-xs font-medium rounded ${getStatusColor(payment.status, isDark)}`}>{payment.status}</span>
                </td>
                <td className={`py-4 px-4 cursor-pointer ${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}>⋯</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
