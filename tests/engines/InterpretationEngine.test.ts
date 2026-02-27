/**
 * ดาวเทวา — InterpretationEngine Tests (Scaffold)
 * Agent 5 populates these with full assertions.
 */

import {InterpretationEngine} from '../../src/api/InterpretationEngine';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('InterpretationEngine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getFromCache', () => {
    it('returns null when no cached data exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      const result = await InterpretationEngine.getFromCache('2024-04-13');
      expect(result).toBeNull();
    });

    it('returns null when cached data is expired (>6 hours)', async () => {
      const expired = {
        brief: {headlineThai: 'old'},
        cachedAt: Date.now() - 7 * 60 * 60 * 1000, // 7 hours ago
      };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(expired));
      const result = await InterpretationEngine.getFromCache('2024-04-13');
      expect(result).toBeNull();
    });

    it('returns brief when cached data is fresh', async () => {
      const mockBrief = {
        headlineThai: 'วันนี้เป็นวันมงคล',
        bodyThai: 'ดาวพฤหัสเสริมดวง...',
        luckyColor: 'ทอง',
        luckyNumber: 9,
        luckyDirection: 'ทิศตะวันออก',
        warningThai: null,
        generatedAt: new Date(),
        fromCache: false,
      };
      const fresh = {brief: mockBrief, cachedAt: Date.now() - 1000};
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(fresh));
      const result = await InterpretationEngine.getFromCache('2024-04-13');
      expect(result).not.toBeNull();
      expect(result?.headlineThai).toBe('วันนี้เป็นวันมงคล');
    });
  });

  describe('generateTemplateFallback', () => {
    it('returns a valid DailyBrief structure', () => {
      const result = InterpretationEngine.generateTemplateFallback({}, '2024-04-13');
      expect(result).toHaveProperty('headlineThai');
      expect(result).toHaveProperty('bodyThai');
      expect(result).toHaveProperty('luckyColor');
      expect(result).toHaveProperty('luckyNumber');
      expect(result).toHaveProperty('luckyDirection');
      expect(result).toHaveProperty('generatedAt');
      expect(result).toHaveProperty('fromCache');
    });
  });

  describe.skip('callClaudeAPI (Agent 5)', () => {
    it('returns valid Thai-language brief', async () => {
      // TODO (Agent 5)
    });
    it('handles API timeout gracefully', async () => {
      // TODO (Agent 5)
    });
    it('parses Claude JSON response correctly', async () => {
      // TODO (Agent 5)
    });
  });
});
