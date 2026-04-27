import { ApiClient } from './client';

export interface PaymentRecord {
  id: string;
  category: string;
  date: string;
  status: 'On-Verification' | 'Completed' | 'Pending' | 'Failed';
}

type RawPayment = Record<string, unknown>;

const normalizeStatus = (value: unknown): PaymentRecord['status'] => {
  const normalized = String(value ?? '').toLowerCase();
  if (normalized.includes('complete') || normalized.includes('paid') || normalized.includes('success')) {
    return 'Completed';
  }
  if (normalized.includes('pending') || normalized.includes('wait')) {
    return 'Pending';
  }
  if (normalized.includes('fail') || normalized.includes('reject')) {
    return 'Failed';
  }
  return 'On-Verification';
};

const toDisplayDate = (value: unknown): string => {
  if (!value) return new Date().toLocaleDateString();
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? String(value) : parsed.toLocaleDateString();
};

const mapPayment = (item: RawPayment, index: number): PaymentRecord => ({
  id: String(item.id ?? item.paymentId ?? item.transactionId ?? `payment-${index + 1}`),
  category: String(item.category ?? item.title ?? item.type ?? item.description ?? 'Tuition Payment'),
  date: toDisplayDate(item.date ?? item.createdAt ?? item.paymentDate),
  status: normalizeStatus(item.status),
});

export const PaymentService = {
  /**
   * Uses a dedicated student payments endpoint when available.
   * Returns an empty array if the endpoint is missing to avoid fake UI data.
   */
  async getMyPayments(): Promise<PaymentRecord[]> {
    try {
      const response = await ApiClient.get<RawPayment[] | { data?: RawPayment[] }>('/payments/my');
      const list = Array.isArray(response) ? response : (response.data ?? []);
      return list.map(mapPayment);
    } catch {
      return [];
    }
  },
};

