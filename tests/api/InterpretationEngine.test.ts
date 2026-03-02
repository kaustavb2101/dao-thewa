/**
 * InterpretationEngine tests
 * Cache layer · Fallback generation · Output validation
 */
import { InterpretationEngine } from '../../src/api/InterpretationEngine';
import { DailyInterpretation } from '../../src/engines/ThaiRulesEngine';
import { DailyAstroData } from '../../src/engines/AstronomicalEngine';

// ─── MOCK AsyncStorage ─────────────────────────────────────────────
const mockStorage: Record<string, string> = {};

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async (key: string) => mockStorage[key] ?? null),
    setItem: jest.fn(async (key: string, val: string) => { mockStorage[key] = val; }),
    removeItem: jest.fn(async (key: string) => { delete mockStorage[key]; }),
  },
}));

// ─── FIXTURES ─────────────────────────────────────────────────────

const mockInterpretation: DailyInterpretation = {
  headline: 'ดาวมงคลส่องสว่าง',
  headlineEn: 'Auspicious stars shine',
  overallEnergy: 4,
  overallQuality: 'auspicious',
  overallQualityThai: 'มงคล',
  activeRules: [
    {
      id: 'GURU_TRINE_SURYA',
      condition: () => true,
      category: 'auspicious',
      intensity: 4,
      titleThai: 'พฤหัสสามเหลี่ยมสุริยะ',
      titleEn: 'Jupiter trine Sun',
      descriptionThai: 'พลังแห่งโชคลาภ',
      descriptionEn: 'Fortune favors you',
      adviceThai: 'ลงมือทำ',
      adviceEn: 'Take action',
    },
  ],
  wanGerdMessage: 'วันอาทิตย์มงคล',
  lunarMessage: 'จันทร์เต็มดวง',
  horaMessage: 'ฤกษ์พระอาทิตย์',
  luckyDetails: {
    colors: ['ทอง', 'ขาว'],
    numbers: [1, 9],
    directions: ['ตะวันออก'],
    gemstones: [],
    auspiciousHours: [],
  },
  avoidances: [],
  rawDataForAI: {},
};

const mockAstroData = {} as DailyAstroData;

// ─── TESTS ────────────────────────────────────────────────────────

describe('InterpretationEngine', () => {

  beforeEach(() => {
    Object.keys(mockStorage).forEach(k => delete mockStorage[k]);
  });

  test('checkCache returns null when key not in storage', async () => {
    const result = await InterpretationEngine.checkCache('nonexistent_key');
    expect(result).toBeNull();
  });

  test('generateFallbackBrief returns valid GeneratedBrief structure', () => {
    const brief = InterpretationEngine.generateFallbackBrief(
      mockInterpretation, mockAstroData, 'th',
    );
    expect(brief.headlineThai).toBeTruthy();
    expect(brief.headlineEn).toBeTruthy();
    expect(typeof brief.overviewThai).toBe('string');
    expect(Array.isArray(brief.transitReadings)).toBe(true);
    expect(brief.closingThai).toBeTruthy();
    expect(brief.generatedAt).toBeInstanceOf(Date);
  });

  test('fallback Thai headline matches interpretation headline', () => {
    const brief = InterpretationEngine.generateFallbackBrief(
      mockInterpretation, mockAstroData, 'th',
    );
    expect(brief.headlineThai).toBe(mockInterpretation.headline);
  });

  test('fallback English headline matches interpretation headlineEn', () => {
    const brief = InterpretationEngine.generateFallbackBrief(
      mockInterpretation, mockAstroData, 'en',
    );
    expect(brief.headlineEn).toBe(mockInterpretation.headlineEn);
  });

  test('fallback transitReadings length matches activeRules capped at 4', () => {
    const brief = InterpretationEngine.generateFallbackBrief(
      mockInterpretation, mockAstroData, 'th',
    );
    const expectedCount = Math.min(mockInterpretation.activeRules.length, 4);
    expect(brief.transitReadings).toHaveLength(expectedCount);
  });

  test('caution category maps to malefic quality', () => {
    const caut: DailyInterpretation = {
      ...mockInterpretation,
      activeRules: [{ ...mockInterpretation.activeRules[0], id: 'BUDHA_RETROGRADE', category: 'caution' }],
    };
    const brief = InterpretationEngine.generateFallbackBrief(caut, mockAstroData, 'th');
    expect(brief.transitReadings[0].quality).toBe('malefic');
  });

  test('auspicious category maps to benefic quality', () => {
    const brief = InterpretationEngine.generateFallbackBrief(
      mockInterpretation, mockAstroData, 'th',
    );
    expect(brief.transitReadings[0].quality).toBe('benefic');
  });

  test('checkCache returns null for expired entry (> 6 hours)', async () => {
    const key = 'test_expired_key';
    mockStorage[key] = JSON.stringify({
      headlineThai: 'test',
      generatedAt: new Date(Date.now() - 7 * 60 * 60 * 1000),
      transitReadings: [],
    });
    const result = await InterpretationEngine.checkCache(key);
    expect(result).toBeNull();
  });

  test('checkCache returns brief when fresh (< 6 hours old)', async () => {
    const key = 'test_fresh_key';
    mockStorage[key] = JSON.stringify({
      headlineThai: 'ดวงดี',
      headlineEn: 'Good fortune',
      overviewThai: 'วันนี้มีพลังงานดี มีโชคลาภ',
      overviewEn: 'Good energy today',
      transitReadings: [{ quality: 'benefic', intensityLevel: 3, planet: 'GURU' }],
      closingThai: 'โชคดี',
      closingEn: 'Good luck',
      generatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      cacheKey: key,
    });
    const result = await InterpretationEngine.checkCache(key);
    expect(result).not.toBeNull();
    expect(result?.headlineThai).toBe('ดวงดี');
  });

  test('fallback closingThai is non-empty', () => {
    const brief = InterpretationEngine.generateFallbackBrief(
      mockInterpretation, mockAstroData, 'th',
    );
    expect(brief.closingThai.length).toBeGreaterThan(0);
  });

  test('fallback assigns planetEmoji for each transit reading', () => {
    const brief = InterpretationEngine.generateFallbackBrief(
      mockInterpretation, mockAstroData, 'th',
    );
    brief.transitReadings.forEach(t => {
      expect(typeof t.planetEmoji).toBe('string');
    });
  });

  test('generateDailyBrief returns valid brief even without API key (fallback)', async () => {
    const brief = await InterpretationEngine.generateDailyBrief(
      mockInterpretation, mockAstroData, 'th',
    );
    expect(brief).toBeDefined();
    expect(brief.headlineThai).toBeTruthy();
    expect(brief.cacheKey).toBeDefined();
  });
});
