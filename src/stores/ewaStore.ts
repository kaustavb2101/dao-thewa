import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Types ────────────────────────────────────────────────────────

export type PayCycle = 'weekly' | 'biweekly' | 'semimonthly' | 'monthly';

export interface Employee {
  id: string;
  name: string;
  employerId: string;
  employerName: string;
  position: string;
  hourlyRate: number;
  payCycle: PayCycle;
  bankLast4: string;
  avatarInitials: string;
}

export interface PayPeriod {
  id: string;
  startDate: string; // ISO date
  endDate: string;
  hoursWorked: number;
  grossEarned: number;   // total earned this period
  netEarned: number;     // after taxes/deductions
  advancedAmount: number; // already drawn
}

export type TransactionStatus = 'pending' | 'completed' | 'failed';
export type TransactionType = 'advance' | 'repayment' | 'fee';

export interface EWATransaction {
  id: string;
  type: TransactionType;
  amount: number;
  fee: number;
  status: TransactionStatus;
  requestedAt: string;    // ISO datetime
  settledAt?: string;
  payPeriodId: string;
  note: string;
}

export interface EWAAccount {
  availableBalance: number;  // max they can draw right now
  totalEarned: number;
  pendingRepayment: number;
  lifetimeAdvanced: number;
  feeRate: number;           // e.g. 0.015 = 1.5%
  maxAdvancePercent: number; // e.g. 0.5 = 50% of earned
}

interface EWAState {
  employee: Employee | null;
  account: EWAAccount | null;
  currentPeriod: PayPeriod | null;
  transactions: EWATransaction[];
  isLoading: boolean;
  error: string | null;
  withdrawAmount: number;

  // Actions
  loadData: () => Promise<void>;
  requestAdvance: (amount: number) => Promise<{ success: boolean; txId?: string; error?: string }>;
  setWithdrawAmount: (amount: number) => void;
  clearError: () => void;
}

// ─── Mock seed data ───────────────────────────────────────────────

const MOCK_EMPLOYEE: Employee = {
  id: 'emp-001',
  name: 'Kaustav Bose',
  employerId: 'emp-org-42',
  employerName: 'Dao Thewa Co., Ltd.',
  position: 'Senior Engineer',
  hourlyRate: 55,
  payCycle: 'biweekly',
  bankLast4: '4291',
  avatarInitials: 'KB',
};

const MOCK_PERIOD: PayPeriod = {
  id: 'pp-2026-05',
  startDate: '2026-05-01',
  endDate: '2026-05-14',
  hoursWorked: 64,
  grossEarned: 3520,
  netEarned: 2816,
  advancedAmount: 400,
};

const MOCK_ACCOUNT: EWAAccount = {
  availableBalance: 2816 * 0.5 - 400, // 50% of net, minus already drawn
  totalEarned: 2816,
  pendingRepayment: 400,
  lifetimeAdvanced: 4600,
  feeRate: 0.015,
  maxAdvancePercent: 0.5,
};

const MOCK_TRANSACTIONS: EWATransaction[] = [
  {
    id: 'tx-001',
    type: 'advance',
    amount: 400,
    fee: 6,
    status: 'completed',
    requestedAt: '2026-05-03T10:22:00Z',
    settledAt: '2026-05-03T10:24:00Z',
    payPeriodId: 'pp-2026-05',
    note: 'Advance to bank ••••4291',
  },
  {
    id: 'tx-002',
    type: 'advance',
    amount: 250,
    fee: 3.75,
    status: 'completed',
    requestedAt: '2026-04-18T14:05:00Z',
    settledAt: '2026-04-18T14:07:00Z',
    payPeriodId: 'pp-2026-04b',
    note: 'Advance to bank ••••4291',
  },
  {
    id: 'tx-003',
    type: 'repayment',
    amount: 253.75,
    fee: 0,
    status: 'completed',
    requestedAt: '2026-04-30T09:00:00Z',
    settledAt: '2026-04-30T09:00:00Z',
    payPeriodId: 'pp-2026-04b',
    note: 'Auto-repaid on payday',
  },
  {
    id: 'tx-004',
    type: 'advance',
    amount: 500,
    fee: 7.5,
    status: 'completed',
    requestedAt: '2026-04-05T08:30:00Z',
    settledAt: '2026-04-05T08:32:00Z',
    payPeriodId: 'pp-2026-04a',
    note: 'Advance to bank ••••4291',
  },
  {
    id: 'tx-005',
    type: 'repayment',
    amount: 507.5,
    fee: 0,
    status: 'completed',
    requestedAt: '2026-04-15T09:00:00Z',
    settledAt: '2026-04-15T09:00:00Z',
    payPeriodId: 'pp-2026-04a',
    note: 'Auto-repaid on payday',
  },
];

// ─── Store ────────────────────────────────────────────────────────

export const useEWAStore = create<EWAState>((set, get) => ({
  employee: null,
  account: null,
  currentPeriod: null,
  transactions: [],
  isLoading: false,
  error: null,
  withdrawAmount: 0,

  loadData: async () => {
    set({ isLoading: true, error: null });
    try {
      // Simulate network delay
      await new Promise(r => setTimeout(r, 800));

      // Try loading persisted transactions from storage
      const storedTx = await AsyncStorage.getItem('ewa_transactions');
      const extra: EWATransaction[] = storedTx ? JSON.parse(storedTx) : [];

      const allTx = [...extra, ...MOCK_TRANSACTIONS].sort(
        (a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime(),
      );

      // Recompute available balance from any extra transactions
      const extraAdvanced = extra
        .filter(t => t.type === 'advance' && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0);

      const account: EWAAccount = {
        ...MOCK_ACCOUNT,
        availableBalance: Math.max(0, MOCK_ACCOUNT.availableBalance - extraAdvanced),
        pendingRepayment: MOCK_ACCOUNT.pendingRepayment + extraAdvanced,
      };

      set({
        employee: MOCK_EMPLOYEE,
        account,
        currentPeriod: { ...MOCK_PERIOD, advancedAmount: MOCK_PERIOD.advancedAmount + extraAdvanced },
        transactions: allTx,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false, error: 'Failed to load account data.' });
    }
  },

  requestAdvance: async (amount: number) => {
    const { account, employee } = get();
    if (!account || !employee) return { success: false, error: 'Account not loaded.' };
    if (amount > account.availableBalance) return { success: false, error: 'Amount exceeds available balance.' };
    if (amount < 10) return { success: false, error: 'Minimum advance is $10.' };

    set({ isLoading: true, error: null });
    try {
      await new Promise(r => setTimeout(r, 1200));

      const fee = parseFloat((amount * account.feeRate).toFixed(2));
      const tx: EWATransaction = {
        id: `tx-${Date.now()}`,
        type: 'advance',
        amount,
        fee,
        status: 'completed',
        requestedAt: new Date().toISOString(),
        settledAt: new Date().toISOString(),
        payPeriodId: get().currentPeriod?.id ?? '',
        note: `Advance to bank ••••${employee.bankLast4}`,
      };

      // Persist new transaction
      const stored = await AsyncStorage.getItem('ewa_transactions');
      const existing: EWATransaction[] = stored ? JSON.parse(stored) : [];
      await AsyncStorage.setItem('ewa_transactions', JSON.stringify([tx, ...existing]));

      set(state => ({
        isLoading: false,
        transactions: [tx, ...state.transactions],
        account: state.account
          ? {
              ...state.account,
              availableBalance: state.account.availableBalance - amount,
              pendingRepayment: state.account.pendingRepayment + amount,
            }
          : null,
        currentPeriod: state.currentPeriod
          ? { ...state.currentPeriod, advancedAmount: state.currentPeriod.advancedAmount + amount }
          : null,
      }));

      return { success: true, txId: tx.id };
    } catch {
      set({ isLoading: false, error: 'Transaction failed. Please try again.' });
      return { success: false, error: 'Transaction failed.' };
    }
  },

  setWithdrawAmount: (amount: number) => set({ withdrawAmount: amount }),
  clearError: () => set({ error: null }),
}));
