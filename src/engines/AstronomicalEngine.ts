/**
 * ดาวเทวา — Astronomical Engine (Stub)
 * Full implementation: AGENT_2_EPHEMERIS.md
 *
 * Responsibilities:
 *  - Swiss Ephemeris planet positions via astronomy-engine
 *  - Hora calculation (Chaldean planetary hour)
 *  - Lunar phase + Nakshatra
 *  - Thai date conversion (Buddhist Era)
 *  - Ayanamsa correction (Lahiri sidereal)
 */

import {BANGKOK_TIMEZONE, BUDDHIST_ERA_OFFSET} from '../../config/constants';
import type {
  PlanetPosition,
  HoraData,
  LunarData,
  ThaiDateData,
} from '../hooks/useDailyData';

// ─────────────────────────────────────────────
// Engine interface (Agent 2 implements all methods)
// ─────────────────────────────────────────────
export interface AstroData {
  planets: PlanetPosition[];
  hora: HoraData;
  lunar: LunarData;
  thaiDate: ThaiDateData;
  sunriseTime: Date;
  sunsetTime: Date;
  latitude: number;
  longitude: number;
}

export class AstronomicalEngine {
  /**
   * Main entry point — computes all astronomical data for a given date+location.
   * @param date    Target date (Bangkok time)
   * @param lat     Observer latitude (defaults to Bangkok: 13.7563)
   * @param lon     Observer longitude (defaults to Bangkok: 100.5018)
   */
  static async computeDailyData(
    date: Date,
    lat: number = 13.7563,
    lon: number = 100.5018,
  ): Promise<AstroData> {
    // TODO (Agent 2): Full implementation using astronomy-engine
    throw new Error('AstronomicalEngine.computeDailyData not yet implemented — see AGENT_2_EPHEMERIS.md');
  }

  /**
   * Compute all 9 Nava Graha planet positions in sidereal zodiac (Lahiri).
   */
  static computePlanetPositions(date: Date, lat: number, lon: number): PlanetPosition[] {
    // TODO (Agent 2)
    throw new Error('Not yet implemented');
  }

  /**
   * Compute the current Hora (planetary hour) for a given moment.
   * Based on Chaldean sequence starting from sunrise.
   */
  static computeHora(date: Date, lat: number, lon: number): HoraData {
    // TODO (Agent 2)
    throw new Error('Not yet implemented');
  }

  /**
   * Compute lunar phase, Nakshatra, and Tithi.
   */
  static computeLunarData(date: Date): LunarData {
    // TODO (Agent 2)
    throw new Error('Not yet implemented');
  }

  /**
   * Convert Gregorian date to Thai Buddhist calendar fields.
   */
  static computeThaiDate(date: Date): ThaiDateData {
    const d = new Date(date);
    return {
      buddhistYear: d.getFullYear() + BUDDHIST_ERA_OFFSET,
      thaiMonthName: '', // TODO (Agent 2)
      thaiDayName: '',   // TODO (Agent 2)
      wanGerdIndex: d.getDay(),
    };
  }

  /**
   * Apply Lahiri ayanamsa correction to convert tropical longitude to sidereal.
   * @param tropicalLongitude  Tropical ecliptic longitude in degrees
   * @param date               Date for ayanamsa calculation
   */
  static applyAyanamsa(tropicalLongitude: number, date: Date): number {
    // TODO (Agent 2): Precise Lahiri ayanamsa calculation
    // Approximate: ~23.85° for 2024
    const LAHIRI_AYANAMSA_2024 = 23.85;
    return ((tropicalLongitude - LAHIRI_AYANAMSA_2024) + 360) % 360;
  }
}
