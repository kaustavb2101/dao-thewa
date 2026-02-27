/**
 * ดาวเทวา — useDailyData Hook
 * React Query hook: orchestrates AstronomicalEngine → ThaiRulesEngine → InterpretationEngine
 * Full computation logic implemented by Agents 2, 3, 5.
 */

import {useQuery} from '@tanstack/react-query';
import {DateTime} from 'luxon';
import {BANGKOK_TIMEZONE, CACHE_TTL_MS} from '../../config/constants';

// ─────────────────────────────────────────────
// Output types (consumed by all screens)
// ─────────────────────────────────────────────
export interface PlanetPosition {
  grahaKey: string;
  longitude: number;    // ecliptic degrees 0–360
  rasiIndex: number;    // which of 12 zodiac signs (0–11)
  nakshatraIndex: number; // which of 27 nakshatras (0–26)
  isRetrograde: boolean;
}

export interface HoraData {
  currentGraha: string;   // which planet rules this hour
  horaStartTime: Date;
  horaEndTime: Date;
  horaIndex: number;      // 0–23 within the day
}

export interface LunarData {
  phase: number;          // 0–1 (new→full→new)
  phaseNameThai: string;
  moonLongitude: number;
  nakshatraIndex: number;
  tithi: number;          // lunar day 1–30
}

export interface ThaiDateData {
  buddhistYear: number;
  thaiMonthName: string;
  thaiDayName: string;
  wanGerdIndex: number;   // day of week 0–6
}

export interface AuspiciousnessData {
  overallScore: number;   // 0–100
  level: string;          // 'VERY_AUSPICIOUS' | 'AUSPICIOUS' | etc.
  factors: Array<{
    rule: string;
    impact: number;       // positive or negative
    descriptionThai: string;
  }>;
}

export interface DailyBrief {
  headlineThai: string;
  bodyThai: string;
  luckyColor: string;
  luckyNumber: number;
  luckyDirection: string;
  warningThai: string | null;
  generatedAt: Date;
  fromCache: boolean;
}

export interface DailyData {
  date: Date;
  planets: PlanetPosition[];
  hora: HoraData;
  lunar: LunarData;
  thaiDate: ThaiDateData;
  auspiciousness: AuspiciousnessData;
  brief: DailyBrief | null;
}

// ─────────────────────────────────────────────
// Query key factory
// ─────────────────────────────────────────────
export const dailyDataKeys = {
  all: ['dailyData'] as const,
  forDate: (dateStr: string) => [...dailyDataKeys.all, dateStr] as const,
};

// ─────────────────────────────────────────────
// Placeholder fetch function
// Replaced by full implementation in Agent 5
// ─────────────────────────────────────────────
async function fetchDailyData(date: Date): Promise<DailyData> {
  // TODO (Agent 2): Replace with AstronomicalEngine.computeDailyData(date)
  // TODO (Agent 3): Pipe through ThaiRulesEngine.interpret(astroData)
  // TODO (Agent 5): Pipe through InterpretationEngine.generateDailyBrief()

  // Placeholder data for scaffold validation
  return {
    date,
    planets: [],
    hora: {
      currentGraha: 'SURYA',
      horaStartTime: new Date(),
      horaEndTime: new Date(),
      horaIndex: 0,
    },
    lunar: {
      phase: 0,
      phaseNameThai: 'กำลังคำนวณ...',
      moonLongitude: 0,
      nakshatraIndex: 0,
      tithi: 1,
    },
    thaiDate: {
      buddhistYear: new Date().getFullYear() + 543,
      thaiMonthName: 'กำลังคำนวณ...',
      thaiDayName: 'กำลังคำนวณ...',
      wanGerdIndex: new Date().getDay(),
    },
    auspiciousness: {
      overallScore: 0,
      level: 'NEUTRAL',
      factors: [],
    },
    brief: null,
  };
}

// ─────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────
export function useDailyData(date?: Date) {
  const targetDate = date ?? new Date();
  const dateStr = DateTime.fromJSDate(targetDate)
    .setZone(BANGKOK_TIMEZONE)
    .toISODate() ?? '';

  return useQuery({
    queryKey: dailyDataKeys.forDate(dateStr),
    queryFn: () => fetchDailyData(targetDate),
    staleTime: CACHE_TTL_MS,
    gcTime: CACHE_TTL_MS * 2,
  });
}
