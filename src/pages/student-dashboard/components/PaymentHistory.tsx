import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useApi } from '../../../hooks/useApi';
import { PaymentService, type PaymentRecord } from '../../../services/api/paymentService';

interface PaymentHistoryProps {
  payments?: PaymentRecord[];
}

const getStatusColor = (status: string, isDark: boolean) => {
  const colors = {
    'On-Verification': isDark ? 'bg-yellow-900/50 text-yellow-400' : 'bg-yellow-50 text-yellow-700',
    Completed: isDark ? 'bg-green-900/50 text-green-400' : 'bg-green-50 text-green-700',
    Pending: isDark ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-50 text-blue-700',
    Failed: isDark ? 'bg-red-900/50 text-red-400' : 'bg-red-50 text-red-700',
  };
  return colors[status as keyof typeof colors] || colors['On-Verification'];
};

export default function PaymentHistory({ payments: paymentsProp }: PaymentHistoryProps) {
  const { isDark, primaryHex } = useTheme() as any;
  const accentColor = primaryHex || '#3b82f6';
  const { t } = useLanguage();
  const { data: apiPayments = [], loading } = useApi(() => PaymentService.getMyPayments(), []);

  const payments = paymentsProp ?? apiPayments;

  return (
    <div
      className={`rounded-3xl border p-6 transition-all duration-300 ${
        isDark
          ? 'bg-card-dark border-white/5 shadow-xl shadow-black/20'
          : 'bg-white border-slate-200 shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {t('paymentTuitionHistory')}
          </h2>
          <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
            {t('paymentHistoryDesc')}
          </p>
        </div>
        <button
          className="text-sm font-bold hover:opacity-80 transition-opacity"
          style={{ color: accentColor }}
        >
          {t('viewAllPayment')}
        </button>
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <div className={`py-8 text-sm text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Loading payments...
          </div>
        ) : payments.length === 0 ? (
          <div className={`py-8 text-sm text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            No payment records available yet.
          </div>
        ) : (
          <table className="w-full text-sm">
          <thead className={`border-b ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
            <tr>
              <th
                className={`text-left py-3 px-4 font-semibold ${isDark ? 'text-slate-400' : 'text-slate-700'}`}
              >
                {t('paymentId')}
              </th>
              <th
                className={`text-left py-3 px-4 font-semibold ${isDark ? 'text-slate-400' : 'text-slate-700'}`}
              >
                {t('paymentCategory')}
              </th>
              <th
                className={`text-left py-3 px-4 font-semibold ${isDark ? 'text-slate-400' : 'text-slate-700'}`}
              >
                {t('date')}
              </th>
              <th
                className={`text-left py-3 px-4 font-semibold ${isDark ? 'text-slate-400' : 'text-slate-700'}`}
              >
                {t('paymentStatus')}
              </th>
              <th
                className={`text-left py-3 px-4 font-semibold ${isDark ? 'text-slate-400' : 'text-slate-700'}`}
              />
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr
                key={payment.id}
                className={`border-b transition-colors ${isDark ? 'border-white/5 hover:bg-white/5' : 'border-slate-100 hover:bg-slate-50'}`}
              >
                <td className={`py-4 px-4 ${isDark ? 'text-slate-300' : 'text-slate-900'}`}>
                  {payment.id}
                </td>
                <td className={`py-4 px-4 ${isDark ? 'text-slate-300' : 'text-slate-900'}`}>
                  {payment.category}
                </td>
                <td className={`py-4 px-4 ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
                  {payment.date}
                </td>
                <td className="py-4 px-4">
                  <span
                    className={`inline-block px-3 py-1 text-xs font-bold rounded-lg ${getStatusColor(payment.status, isDark)}`}
                  >
                    {payment.status}
                  </span>
                </td>
                <td
                  className={`py-4 px-4 cursor-pointer ${isDark ? 'text-slate-500 hover:text-slate-400' : 'text-slate-500 hover:text-slate-600'}`}
                >
                  ⋯
                </td>
              </tr>
            ))}
          </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
