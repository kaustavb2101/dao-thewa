/**
 * EWA Store tests
 * Validates: data loading, advance requests, balance updates, error cases
 */
import { useEWAStore } from '../../src/stores/ewaStore';

const mockStorage: Record<string, string> = {};

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async (key: string) => mockStorage[key] ?? null),
    setItem: jest.fn(async (key: string, val: string) => { mockStorage[key] = val; }),
    removeItem: jest.fn(async (key: string) => { delete mockStorage[key]; }),
  },
}));

// ─── Reset store + storage before every test ──────────────────────

beforeEach(() => {
  Object.keys(mockStorage).forEach(k => delete mockStorage[k]);
  jest.clearAllMocks();
  useEWAStore.setState({
    employee: null,
    account: null,
    currentPeriod: null,
    transactions: [],
    isLoading: false,
    error: null,
    withdrawAmount: 0,
  });
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

async function loadStore() {
  const loadPromise = useEWAStore.getState().loadData();
  await jest.runAllTimersAsync();
  await loadPromise;
  return useEWAStore.getState();
}

async function loadAndAdvance(amount: number) {
  await loadStore();
  const advancePromise = useEWAStore.getState().requestAdvance(amount);
  await jest.runAllTimersAsync();
  return advancePromise;
}

// ─── loadData ────────────────────────────────────────────────────

describe('loadData', () => {
  it('populates employee, account and currentPeriod', async () => {
    const state = await loadStore();
    expect(state.employee).not.toBeNull();
    expect(state.account).not.toBeNull();
    expect(state.currentPeriod).not.toBeNull();
    expect(state.isLoading).toBe(false);
  });

  it('loads the 5 seeded mock transactions', async () => {
    const state = await loadStore();
    expect(state.transactions.length).toBeGreaterThanOrEqual(5);
  });

  it('computes a positive available balance', async () => {
    const state = await loadStore();
    expect(state.account!.availableBalance).toBeGreaterThan(0);
  });

  it('available balance respects 50% cap minus existing advances', async () => {
    const state = await loadStore();
    const { account, currentPeriod } = state;
    const expected =
      currentPeriod!.netEarned * account!.maxAdvancePercent -
      currentPeriod!.advancedAmount;
    expect(account!.availableBalance).toBeCloseTo(Math.max(0, expected), 1);
  });

  it('clears error on successful load', async () => {
    useEWAStore.setState({ error: 'stale error' });
    await loadStore();
    expect(useEWAStore.getState().error).toBeNull();
  });
});

// ─── requestAdvance ───────────────────────────────────────────────

describe('requestAdvance', () => {
  it('succeeds for a valid amount and returns a transaction id', async () => {
    const result = await loadAndAdvance(50);
    expect(result.success).toBe(true);
    expect(result.txId).toBeTruthy();
  });

  it('reduces availableBalance by the advance amount', async () => {
    await loadStore();
    const before = useEWAStore.getState().account!.availableBalance;
    await loadAndAdvance(100);
    const after = useEWAStore.getState().account!.availableBalance;
    expect(after).toBeCloseTo(before - 100, 2);
  });

  it('increases pendingRepayment by the advance amount', async () => {
    await loadStore();
    const before = useEWAStore.getState().account!.pendingRepayment;
    await loadAndAdvance(100);
    const after = useEWAStore.getState().account!.pendingRepayment;
    expect(after).toBeCloseTo(before + 100, 2);
  });

  it('prepends a completed advance transaction to the list', async () => {
    await loadStore();
    const countBefore = useEWAStore.getState().transactions.length;
    await loadAndAdvance(75);
    const txList = useEWAStore.getState().transactions;
    expect(txList.length).toBe(countBefore + 1);
    expect(txList[0].type).toBe('advance');
    expect(txList[0].amount).toBe(75);
    expect(txList[0].status).toBe('completed');
  });

  it('calculates fee at exactly 1.5% of the amount', async () => {
    await loadStore();
    await loadAndAdvance(200);
    const tx = useEWAStore.getState().transactions[0];
    expect(tx.fee).toBeCloseTo(200 * 0.015, 2);
  });

  it('rejects amounts below $10 minimum', async () => {
    await loadStore();
    const advancePromise = useEWAStore.getState().requestAdvance(5);
    await jest.runAllTimersAsync();
    const result = await advancePromise;
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/minimum/i);
  });

  it('rejects amounts exceeding available balance', async () => {
    const state = await loadStore();
    const { availableBalance } = state.account!;
    const advancePromise = useEWAStore.getState().requestAdvance(availableBalance + 1000);
    await jest.runAllTimersAsync();
    const result = await advancePromise;
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/exceeds/i);
  });

  it('persists the transaction to AsyncStorage', async () => {
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    await loadAndAdvance(50);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'ewa_transactions',
      expect.stringContaining('"type":"advance"'),
    );
  });

  it('does not modify state when account is not loaded', async () => {
    // Don't call loadData; account is null
    const result = await useEWAStore.getState().requestAdvance(50);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/not loaded/i);
  });
});

// ─── setWithdrawAmount / clearError ───────────────────────────────

describe('setWithdrawAmount', () => {
  it('updates withdrawAmount in state', () => {
    useEWAStore.getState().setWithdrawAmount(250);
    expect(useEWAStore.getState().withdrawAmount).toBe(250);
  });
});

describe('clearError', () => {
  it('resets error to null', () => {
    useEWAStore.setState({ error: 'Something went wrong' });
    useEWAStore.getState().clearError();
    expect(useEWAStore.getState().error).toBeNull();
  });
});
