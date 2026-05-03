/**
 * ดาวเทวา — AutoXFaceAnalyzer
 * Autonomous face-reading pipeline (AutoX pattern).
 *
 * AutoX defines a sequential, self-driving analysis chain where each stage
 * automatically feeds its output into the next, requiring zero manual
 * intervention between steps:
 *
 *  Stage 1 — ShapeClassifier  : element from face shape
 *  Stage 2 — ZoneScorer       : score each of 5 face zones
 *  Stage 3 — ElementResolver  : resolve compatible / conflicting elements
 *  Stage 4 — PlanetarySync    : blend with live Nava Graha hora data
 *  Stage 5 — ReadingGenerator : produce the full FaceReadingResult
 *
 * Use Cases:
 *  • Onboarding self-assessment wizard (no camera required)
 *  • Astro-integration: correlate face element with daily planetary hora
 *  • Compatibility matching (compare two face-element profiles)
 *  • AutoX batch analysis (analyze multiple profiles offline)
 */

import {
  WuXingElement,
  FaceZoneId,
  ZoneScore,
  FaceReadingResult,
  FaceReadingEngine,
  AutoXStageLog,
  FACE_ZONES,
} from '../engines/FaceReadingEngine';

// ─── PIPELINE CONTEXT ─────────────────────────────────────────────

export interface AutoXInput {
  shapeElement: WuXingElement;
  zoneSelections: Partial<Record<FaceZoneId, string>>; // zoneId → featureId
  horaName?: string;        // current planetary hour (from DailyData)
  birthElement?: WuXingElement; // natal element from birth date
}

export interface AutoXPipelineState {
  input: AutoXInput;
  shapeResolved: boolean;
  zonesScored: ZoneScore[];
  elementSynced: boolean;
  planetarySynced: boolean;
  result: FaceReadingResult | null;
  logs: AutoXStageLog[];
  error: string | null;
  durationMs: number;
}

// ─── PIPELINE ─────────────────────────────────────────────────────

export class AutoXFaceAnalyzer {

  private state: AutoXPipelineState;
  private startTime: number;

  constructor(input: AutoXInput) {
    this.startTime = Date.now();
    this.state = {
      input,
      shapeResolved: false,
      zonesScored: [],
      elementSynced: false,
      planetarySynced: false,
      result: null,
      logs: [],
      error: null,
      durationMs: 0,
    };
  }

  // ── Stage 1: Shape Classifier ──────────────────────────────────

  private stageShapeClassifier(): WuXingElement {
    const el = this.state.input.shapeElement;
    this.state.shapeResolved = true;
    this.log('AutoX:ShapeClassifier', `ธาตุรูปหน้า: ${el}`, 92);
    return el;
  }

  // ── Stage 2: Zone Scorer ───────────────────────────────────────

  private stageZoneScorer(): ZoneScore[] {
    const scores: ZoneScore[] = [];

    for (const zone of FACE_ZONES) {
      const featureId = this.state.input.zoneSelections[zone.id];
      if (!featureId) continue;

      const feature = zone.features.find(f => f.id === featureId);
      if (!feature) continue;

      scores.push({
        zoneId: zone.id,
        featureId,
        score: feature.score,
        quality: feature.quality,
      });
    }

    this.state.zonesScored = scores;
    const avg = scores.length
      ? Math.round(scores.reduce((s, z) => s + z.score, 0) / scores.length * 10)
      : 0;
    this.log('AutoX:ZoneScorer', `ประเมิน ${scores.length} โซน · คะแนนเฉลี่ย ${avg}%`, scores.length === 5 ? 95 : 75);
    return scores;
  }

  // ── Stage 3: Element Resolver ──────────────────────────────────

  private stageElementResolver(element: WuXingElement): void {
    const compat = FaceReadingEngine.compatibleElements(element);
    const conflict = FaceReadingEngine.conflictingElements(element);
    this.state.elementSynced = true;
    this.log(
      'AutoX:ElementResolver',
      `ธาตุเสริม: ${compat.join('·')} · ธาตุขัดแย้ง: ${conflict.join('·')}`,
      88,
    );
  }

  // ── Stage 4: Planetary Sync ────────────────────────────────────

  private stagePlanetarySync(element: WuXingElement): void {
    const hora = this.state.input.horaName;
    const msg = FaceReadingEngine.planetaryResonance(element, hora);
    this.state.planetarySynced = true;
    this.log('AutoX:PlanetarySync', msg, hora ? 90 : 65);
  }

  // ── Stage 5: Reading Generator ─────────────────────────────────

  private stageReadingGenerator(element: WuXingElement, zones: ZoneScore[]): FaceReadingResult {
    const result = FaceReadingEngine.interpret(element, zones, this.state.input.horaName);
    this.state.result = result;
    this.log('AutoX:ReadingGenerator', result.headline, result.autoXConfidence);
    return result;
  }

  // ── Utility ───────────────────────────────────────────────────

  private log(stage: string, resultThai: string, confidence: number): void {
    this.state.logs.push({ stage, resultThai, confidence });
  }

  // ── Public Run ────────────────────────────────────────────────

  run(): AutoXPipelineState {
    try {
      const element = this.stageShapeClassifier();
      const zones   = this.stageZoneScorer();
      this.stageElementResolver(element);
      this.stagePlanetarySync(element);
      this.stageReadingGenerator(element, zones);
    } catch (err) {
      this.state.error = err instanceof Error ? err.message : 'AutoX pipeline error';
    }

    this.state.durationMs = Date.now() - this.startTime;
    return this.state;
  }

  // ── Convenience factory ───────────────────────────────────────

  static analyze(input: AutoXInput): AutoXPipelineState {
    return new AutoXFaceAnalyzer(input).run();
  }

  // ── Use-case helpers ──────────────────────────────────────────

  /**
   * Compatibility score between two face-element profiles (0–100).
   * Based on the Wu Xing generating/controlling cycle.
   */
  static elementCompatibility(a: WuXingElement, b: WuXingElement): {
    score: number;
    labelThai: string;
    reasonThai: string;
  } {
    if (a === b) return { score: 90, labelThai: 'เหมือนธาตุ', reasonThai: 'ธาตุเดียวกัน เข้าใจกันดีมาก' };

    const compat = FaceReadingEngine.compatibleElements(a);
    if (compat.includes(b)) {
      return { score: 85, labelThai: 'สอดคล้อง', reasonThai: 'ธาตุวงจรสร้างสรรค์ เกื้อกูลกัน' };
    }

    const conflict = FaceReadingEngine.conflictingElements(a);
    if (conflict.includes(b)) {
      return { score: 35, labelThai: 'ขัดแย้ง', reasonThai: 'ธาตุวงจรควบคุม ต้องปรับตัวสูง' };
    }

    return { score: 60, labelThai: 'กลางๆ', reasonThai: 'ธาตุเป็นกลาง สามารถพัฒนาความสัมพันธ์ได้' };
  }

  /**
   * Returns the ideal daily element enhancement recommendation.
   * Used for AutoX daily recommendations in DailyBriefScreen.
   */
  static dailyElementBoost(
    faceElement: WuXingElement,
    todayHoraElement: WuXingElement,
  ): { boostThai: string; avoidThai: string } {
    const compat = FaceReadingEngine.compatibleElements(faceElement);
    const isBoost = compat.includes(todayHoraElement);

    return {
      boostThai: isBoost
        ? `ฤกษ์วันนี้เสริมธาตุ${faceElement} — เหมาะสำหรับการตัดสินใจสำคัญ`
        : `เสริมธาตุ${compat[0]} ด้วยสี${FACE_ZONES.find(z => z.element === compat[0])?.symbol ?? ''} เพื่อสมดุล`,
      avoidThai: `หลีกเลี่ยงการขัดแย้งกับธาตุ${FaceReadingEngine.conflictingElements(faceElement)[0]}`,
    };
  }
}
