interface PaymentRecord {
  id: string;
  category: string;
  date: string;
  status: 'On-Verification' | 'Completed' | 'Pending' | 'Failed';
}

interface PaymentHistoryProps {
  payments?: PaymentRecord[];
}

const getStatusColor = (status: string) => {
  const colors = {
    'On-Verification': 'bg-yellow-50 text-yellow-700',
    'Completed': 'bg-green-50 text-green-700',
    'Pending': 'bg-blue-50 text-blue-700',
    'Failed': 'bg-red-50 text-red-700',
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
  return (
    <div className="mt-6 bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Payment & Tuition History</h2>
          <p className="text-sm text-gray-600">Complete data about your payment and tuition history</p>
        </div>
        <button className="text-purple-600 text-sm font-medium hover:text-purple-700 transition-colors">View All Payment</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Payment ID</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Payment Category</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Payment Status</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700" />
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-4 px-4">{payment.id}</td>
                <td className="py-4 px-4">{payment.category}</td>
                <td className="py-4 px-4 text-gray-600">{payment.date}</td>
                <td className="py-4 px-4">
                  <span className={`inline-block px-3 py-1 text-xs font-medium rounded ${getStatusColor(payment.status)}`}>{payment.status}</span>
                </td>
                <td className="py-4 px-4 text-gray-400 cursor-pointer hover:text-gray-600">⋯</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
