/**
 * ดาวเทวา — useDailyData
 * Full pipeline: AstronomicalEngine → ThaiRulesEngine → InterpretationEngine
 * React Query with 30-min stale time + 6-hour cache
 */
import { useQuery } from '@tanstack/react-query';
import { AstronomicalEngine, DailyAstroData } from '../engines/AstronomicalEngine';
import { ThaiRulesEngine, DailyInterpretation, RuleInputData } from '../engines/ThaiRulesEngine';
import { InterpretationEngine, GeneratedBrief } from '../api/InterpretationEngine';
import { useUserStore } from '../stores/userStore';

// ─── TYPES ────────────────────────────────────────────────────────

export interface DailyData {
  astroData: DailyAstroData;
  interpretation: DailyInterpretation;
  brief: GeneratedBrief;
  // Convenience shortcuts for screens
  planets: DailyAstroData['planets'];
  lunarPhase: DailyAstroData['lunarPhase'];
  currentHora: DailyAstroData['currentHora'];
  thaiDate: DailyAstroData['thaiDate'];
  horaHours: DailyAstroData['horaHours'];
  natalTransits: DailyAstroData['natalTransits'];
}

// ─── QUERY KEY ────────────────────────────────────────────────────
// Refreshes once per calendar day (Bangkok time)
const todayKey = () => {
  const now = new Date();
  // Use Bangkok date (UTC+7)
  const bkk = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  return bkk.toISOString().split('T')[0];
};

// ─── MAIN HOOK ────────────────────────────────────────────────────

export const useDailyData = () => {
  const { user, preferences } = useUserStore();

  return useQuery<DailyData>({
    queryKey: ['dailyData', todayKey()],

    queryFn: async (): Promise<DailyData> => {
      const lat = user?.birthLat ?? 13.7563;   // Default: Bangkok
      const lng = user?.birthLng ?? 100.5018;
      const lang = user?.language ?? preferences.language ?? 'th';

      // ── STEP 1: Astronomical computation ──────────────────────────
      const astroData = await AstronomicalEngine.computeDailyData(
        new Date(),
        lat,
        lng,
        user?.natalChart,
      );

      // ── STEP 2: Thai rules interpretation ─────────────────────────
      const ruleInput: RuleInputData = {
        planets: astroData.planets,
        transits: astroData.natalTransits ?? [],
        lunarPhase: astroData.lunarPhase,
        currentHora: astroData.currentHora,
        thaiDate: astroData.thaiDate,
        wanGerd: user?.wanGerd ?? new Date().getDay(),
        birthRasi: user?.birthRasi ?? 0,
        birthNakshatra: user?.birthNakshatra ?? 0,
        horaHours: astroData.horaHours ?? [],
      };
      const interpretation = ThaiRulesEngine.interpret(ruleInput);

      // ── STEP 3: AI brief generation ────────────────────────────────
      const brief = await InterpretationEngine.generateDailyBrief(
        interpretation,
        astroData,
        lang,
      );

      return {
        astroData,
        interpretation,
        brief,
        // Convenience shortcuts
        planets: astroData.planets,
        lunarPhase: astroData.lunarPhase,
        currentHora: astroData.currentHora,
        thaiDate: astroData.thaiDate,
        horaHours: astroData.horaHours,
        natalTransits: astroData.natalTransits,
      };
    },

    staleTime: 1000 * 60 * 30,        // 30 minutes — re-fetch if stale
    gcTime: 1000 * 60 * 60 * 6,    // 6 hours — keep in memory
    retry: 2,
    retryDelay: 1000,
  });
};

// ─── SELECTOR HOOKS ───────────────────────────────────────────────

export const useDailyBrief = () => {
  const { data } = useDailyData();
  return data?.brief ?? null;
};

export const useDailyInterpretation = () => {
  const { data } = useDailyData();
  return data?.interpretation ?? null;
};

export const useCurrentHora = () => {
  const { data } = useDailyData();
  return data?.currentHora ?? null;
};

export const useLunarPhase = () => {
  const { data } = useDailyData();
  return data?.lunarPhase ?? null;
};

export const useThaiDate = () => {
  const { data } = useDailyData();
  return data?.thaiDate ?? null;
};
