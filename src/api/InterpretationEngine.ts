/**
 * ดาวเทวา — Interpretation Engine (Stub)
 * Full implementation: AGENT_5_SCHEDULER.md
 *
 * Responsibilities:
 *  - Call Claude API (claude-sonnet-4-6) with structured astro data
 *  - 6-hour response cache via AsyncStorage
 *  - Fallback to template generation if API unavailable
 *  - Parse + validate JSON response from Claude
 *  - Return beautiful Thai-language daily reading
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {ENV} from '../../config/env';
import {CACHE_TTL_MS} from '../../config/constants';
import type {DailyBrief} from '../hooks/useDailyData';

// ─────────────────────────────────────────────
// Cache
// ─────────────────────────────────────────────
const CACHE_KEY_PREFIX = '@daothewa:brief:';

interface CachedBrief {
  brief: DailyBrief;
  cachedAt: number;
}

// ─────────────────────────────────────────────
// Engine (Agent 5 implements all methods)
// ─────────────────────────────────────────────
export class InterpretationEngine {
  /**
   * Main entry point — generate or retrieve cached daily brief.
   * @param rawDataForAI  Structured data from ThaiRulesEngine.buildRawDataForAI()
   * @param dateKey       ISO date string used as cache key
   */
  static async generateDailyBrief(
    rawDataForAI: Record<string, unknown>,
    dateKey: string,
  ): Promise<DailyBrief> {
    // 1. Check cache
    const cached = await InterpretationEngine.getFromCache(dateKey);
    if (cached) {
      return {...cached, fromCache: true};
    }

    // 2. Try Claude API
    try {
      const brief = await InterpretationEngine.callClaudeAPI(rawDataForAI, dateKey);
      await InterpretationEngine.saveToCache(dateKey, brief);
      return brief;
    } catch (error) {
      console.warn('[InterpretationEngine] Claude API failed, using template fallback:', error);
      return InterpretationEngine.generateTemplateFallback(rawDataForAI, dateKey);
    }
  }

  /**
   * Call Claude API with structured Thai astrology prompt.
   * TODO (Agent 5): Full prompt engineering + JSON parsing
   */
  static async callClaudeAPI(
    rawDataForAI: Record<string, unknown>,
    _dateKey: string,
  ): Promise<DailyBrief> {
    // TODO (Agent 5): Full implementation
    throw new Error('InterpretationEngine.callClaudeAPI not yet implemented — see AGENT_5_SCHEDULER.md');
  }

  /**
   * Generate template-based fallback if Claude API is unavailable.
   * TODO (Agent 5): Thai template system
   */
  static generateTemplateFallback(
    _rawDataForAI: Record<string, unknown>,
    _dateKey: string,
  ): DailyBrief {
    // TODO (Agent 5): Full template implementation
    return {
      headlineThai: 'ระบบกำลังโหลดข้อมูล...',
      bodyThai: 'กรุณารอสักครู่ ระบบกำลังคำนวณดวงดาวสำหรับวันนี้',
      luckyColor: 'ทอง',
      luckyNumber: 9,
      luckyDirection: 'ทิศตะวันออก',
      warningThai: null,
      generatedAt: new Date(),
      fromCache: false,
    };
  }

  /**
   * Retrieve cached brief from AsyncStorage if still valid.
   */
  static async getFromCache(dateKey: string): Promise<DailyBrief | null> {
    try {
      const raw = await AsyncStorage.getItem(CACHE_KEY_PREFIX + dateKey);
      if (!raw) return null;

      const cached: CachedBrief = JSON.parse(raw);
      const age = Date.now() - cached.cachedAt;

      if (age > CACHE_TTL_MS) {
        await AsyncStorage.removeItem(CACHE_KEY_PREFIX + dateKey);
        return null;
      }

      return cached.brief;
    } catch {
      return null;
    }
  }

  /**
   * Save brief to AsyncStorage cache.
   */
  static async saveToCache(dateKey: string, brief: DailyBrief): Promise<void> {
    const payload: CachedBrief = {brief, cachedAt: Date.now()};
    await AsyncStorage.setItem(
      CACHE_KEY_PREFIX + dateKey,
      JSON.stringify(payload),
    );
  }
}
