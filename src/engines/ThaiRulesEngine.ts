/**
 * ดาวเทวา — Thai Rules Engine (Stub)
 * Full implementation: AGENT_3_RULES.md
 *
 * Responsibilities:
 *  - 4,000+ Thai astrological rules as pure logic
 *  - Hora quality assessment
 *  - Planet dignity (exaltation, debilitation, own sign)
 *  - Nakshatra quality by day
 *  - Wan Gerd deity influence
 *  - Auspiciousness scoring 0–100
 */

import type {AstroData} from './AstronomicalEngine';
import type {AuspiciousnessData} from '../hooks/useDailyData';

// ─────────────────────────────────────────────
// Rule types
// ─────────────────────────────────────────────
export interface RuleResult {
  ruleId: string;
  ruleName: string;
  impact: number;       // Positive (auspicious) or negative (challenging)
  weight: number;       // Rule importance 1–10
  descriptionThai: string;
  category: RuleCategory;
}

export type RuleCategory =
  | 'HORA'
  | 'NAKSHATRA'
  | 'WAN_GERD'
  | 'PLANET_DIGNITY'
  | 'ASPECT'
  | 'TITHI'
  | 'SPECIAL';

export interface RulesEngineOutput {
  auspiciousness: AuspiciousnessData;
  ruleResults: RuleResult[];
  rawDataForAI: Record<string, unknown>;
}

// ─────────────────────────────────────────────
// Engine (Agent 3 implements all methods)
// ─────────────────────────────────────────────
export class ThaiRulesEngine {
  /**
   * Main entry point — fire all rules against astro data, return scored output.
   */
  static interpret(astroData: AstroData): RulesEngineOutput {
    // TODO (Agent 3): Full 4,000+ rule implementation
    throw new Error('ThaiRulesEngine.interpret not yet implemented — see AGENT_3_RULES.md');
  }

  /**
   * Evaluate Hora quality for the current planetary hour.
   */
  static evaluateHora(astroData: AstroData): RuleResult[] {
    // TODO (Agent 3)
    throw new Error('Not yet implemented');
  }

  /**
   * Evaluate Nakshatra quality for today's Moon nakshatra.
   */
  static evaluateNakshatra(astroData: AstroData): RuleResult[] {
    // TODO (Agent 3)
    throw new Error('Not yet implemented');
  }

  /**
   * Evaluate Wan Gerd (birth day deity) influence.
   */
  static evaluateWanGerd(astroData: AstroData, wanGerdIndex: number): RuleResult[] {
    // TODO (Agent 3)
    throw new Error('Not yet implemented');
  }

  /**
   * Evaluate planet dignities — exaltation, debilitation, own sign, enemy sign.
   */
  static evaluatePlanetDignities(astroData: AstroData): RuleResult[] {
    // TODO (Agent 3)
    throw new Error('Not yet implemented');
  }

  /**
   * Compute overall auspiciousness score from weighted rule results.
   */
  static scoreAuspiciousness(ruleResults: RuleResult[]): AuspiciousnessData {
    // TODO (Agent 3)
    throw new Error('Not yet implemented');
  }

  /**
   * Serialize astro + rule data into the structured object sent to Claude API.
   */
  static buildRawDataForAI(
    astroData: AstroData,
    ruleResults: RuleResult[],
  ): Record<string, unknown> {
    // TODO (Agent 3)
    throw new Error('Not yet implemented');
  }
}
