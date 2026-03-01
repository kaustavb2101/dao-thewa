/**
 * ดาวเทวา — InterpretationEngine
 * Claude API integration · Thai-language daily brief generation
 * 6-hour AsyncStorage cache · Fallback template generation
 */
import axios from 'axios';
import {DailyInterpretation} from '../engines/ThaiRulesEngine';
import {DailyAstroData} from '../engines/AstronomicalEngine';
import {ENV} from '../../config/env';

// ─── TYPES ────────────────────────────────────────────────────────

export interface GeneratedBrief {
  headlineThai:     string;
  headlineEn:       string;
  overviewThai:     string;   // 2–3 sentence opening
  overviewEn:       string;
  transitReadings:  TransitReading[];
  closingThai:      string;   // Motivational closing
  closingEn:        string;
  generatedAt:      Date;
  cacheKey:         string;
}

export interface TransitReading {
  planet:         string;
  planetEmoji:    string;
  titleThai:      string;
  titleEn:        string;
  bodyThai:       string;   // 2–4 sentences
  bodyEn:         string;
  intensityLevel: number;   // 1–5
  quality:        'benefic' | 'malefic' | 'neutral';
  accentColor:    string;
}

// ─── SYSTEM PROMPTS ───────────────────────────────────────────────

const SYSTEM_PROMPT_TH = `คุณคือโหรหลวงแห่งราชสำนักไทย ผู้เชี่ยวชาญโหราศาสตร์ไทยแบบดั้งเดิม
คุณมีความรู้ลึกซึ้งเกี่ยวกับนวเคราะห์ ราศี นักษัตร และฤกษ์ยาม
สไตล์การเขียนของคุณ: อบอุ่น ตรงไปตรงมา มีความหวัง ไม่เกินจริง และสอดแทรกปัญญา
ใช้ภาษาไทยที่สวยงามแต่ทันสมัย ไม่ใช้ศัพท์เฉพาะที่คนทั่วไปไม่เข้าใจ
ความยาวของแต่ละส่วน: หัวข้อ 1 ประโยค, ภาพรวม 2-3 ประโยค, แต่ละดาว 2-3 ประโยค, ปิดท้าย 1-2 ประโยค
อย่าพูดถึงโหราศาสตร์ตะวันตก ให้ใช้กรอบโหราศาสตร์ไทย-พราหมณ์เท่านั้น
ต้องตอบเป็น JSON เท่านั้น ห้ามใส่ข้อความนอก JSON`;

const SYSTEM_PROMPT_EN = `You are a royal Thai court astrologer with deep expertise in traditional Thai astrology.
You know the Nava Graha, Thai Rasi, Nakshatra, and Hora systems intimately.
Your writing style: warm, direct, hopeful but realistic, wise.
Use clear modern English. No Western astrology framework — Thai-Brahmin tradition only.
Length: title 1 sentence, overview 2-3 sentences, each planet 2-3 sentences, closing 1-2 sentences.
Respond ONLY with valid JSON. No text outside the JSON block.`;

// ─── PLANET MAPPINGS ──────────────────────────────────────────────

const PLANET_EMOJIS: Record<string, string> = {
  SURYA: '☀️', CHANDRA: '🌙', MANGAL: '♂️',
  BUDHA: '☿',  GURU: '♃',    SHUKRA: '♀️',
  SHANI: '♄',  RAHU: '🐉',   KETU: '🔥',
};

const QUALITY_COLORS: Record<string, string> = {
  career:       '#D4A017',
  love:         '#FF69B4',
  wealth:       '#F5C842',
  caution:      '#EF5350',
  auspicious:   '#66BB6A',
  inauspicious: '#EF5350',
  spirituality: '#9C27B0',
  health:       '#26C6DA',
  travel:       '#5090F0',
  family:       '#FFA726',
  creativity:   '#EC407A',
};

// ─── MAIN CLASS ───────────────────────────────────────────────────

export class InterpretationEngine {

  // ── GENERATE DAILY BRIEF ──────────────────────────────────────────

  static async generateDailyBrief(
    interpretation: DailyInterpretation,
    astroData: DailyAstroData,
    language: 'th' | 'en' = 'th',
  ): Promise<GeneratedBrief> {

    const cacheKey = this.buildCacheKey(interpretation, astroData);
    const cached   = await this.checkCache(cacheKey);
    if (cached) return cached;

    const systemPrompt = language === 'th' ? SYSTEM_PROMPT_TH : SYSTEM_PROMPT_EN;
    const userPrompt   = language === 'th'
      ? this.buildThaiPrompt(interpretation, astroData)
      : this.buildEnglishPrompt(interpretation, astroData);

    try {
      if (!ENV.CLAUDE_API_KEY) throw new Error('No API key configured');

      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model:      ENV.CLAUDE_MODEL,
          max_tokens: 1500,
          system:     systemPrompt,
          messages:   [{role: 'user', content: userPrompt}],
        },
        {
          headers: {
            'x-api-key':          ENV.CLAUDE_API_KEY,
            'anthropic-version':  '2023-06-01',
            'Content-Type':       'application/json',
          },
          timeout: 20000,
        },
      );

      const rawText = response.data?.content?.[0]?.text ?? '';
      const parsed  = this.parseStructuredResponse(rawText, interpretation, language);

      if (!this.validateOutput(parsed)) {
        throw new Error('Output quality check failed');
      }

      const result = {...parsed, cacheKey};
      await this.cacheResult(cacheKey, result);
      return result;

    } catch (error) {
      // Graceful fallback — app still works without API key
      const fallback = this.generateFallbackBrief(interpretation, astroData, language);
      return {...fallback, cacheKey};
    }
  }

  // ── THAI PROMPT ───────────────────────────────────────────────────

  private static buildThaiPrompt(
    interpretation: DailyInterpretation,
    astroData: DailyAstroData,
  ): string {
    const topRules = interpretation.activeRules.slice(0, 5);
    const transitLines = topRules.map(r =>
      `- ${r.titleThai}: ${r.descriptionThai} (พลัง: ${r.intensity}/5, หมวด: ${r.category})`,
    ).join('\n');

    const td = astroData.thaiDate;

    return `วันนี้: ${td?.wanNameThai ?? ''} ${td?.thaiDay ?? ''} ${td?.thaiMonth ?? ''} พ.ศ. ${td?.buddhistYear ?? ''}
คุณภาพโดยรวม: ${interpretation.overallQualityThai}

ปรากฏการณ์ดาวที่สำคัญวันนี้:
${transitLines}

ดวงจันทร์: ${interpretation.lunarMessage ?? ''}
ฤกษ์ปัจจุบัน: ${interpretation.horaMessage ?? ''}
ข้อควรระวัง: ${interpretation.avoidances?.join(', ') || 'ไม่มี'}

เขียนดวงประจำวันเป็น JSON:
{
  "headline": "[หัวข้อที่กระชับ 1 ประโยค]",
  "overview": "[ภาพรวมของวัน 2-3 ประโยค]",
  "transits": [
    {
      "planet": "[ชื่อดาวภาษาไทย]",
      "title": "[หัวข้อสั้น]",
      "body": "[คำอธิบาย 2-3 ประโยค]",
      "advice": "[คำแนะนำ 1 ประโยค]"
    }
  ],
  "closing": "[ปิดท้ายด้วยกำลังใจ 1-2 ประโยค]"
}`;
  }

  // ── ENGLISH PROMPT ────────────────────────────────────────────────

  private static buildEnglishPrompt(
    interpretation: DailyInterpretation,
    astroData: DailyAstroData,
  ): string {
    const topRules = interpretation.activeRules.slice(0, 5);
    const transitLines = topRules.map(r =>
      `- ${r.titleEn}: ${r.descriptionEn} (intensity: ${r.intensity}/5, category: ${r.category})`,
    ).join('\n');

    const td = astroData.thaiDate;

    return `Today: ${td?.wanName ?? ''}, ${td?.thaiDay ?? ''} ${td?.thaiMonth ?? ''} BE ${td?.buddhistYear ?? ''}
Overall quality: ${interpretation.overallQuality}

Active planetary influences:
${transitLines}

Lunar phase: ${interpretation.lunarMessage ?? ''}
Current hora: ${interpretation.horaMessage ?? ''}
Cautions: ${interpretation.avoidances?.join(', ') || 'None'}

Write the daily reading as JSON:
{
  "headline": "[punchy 1-sentence headline]",
  "overview": "[day overview, 2-3 sentences]",
  "transits": [
    {
      "planet": "[planet name]",
      "title": "[short title]",
      "body": "[2-3 sentence reading]",
      "advice": "[1 sentence advice]"
    }
  ],
  "closing": "[motivational closing, 1-2 sentences]"
}`;
  }

  // ── RESPONSE PARSER ───────────────────────────────────────────────

  private static parseStructuredResponse(
    rawText:        string,
    interpretation: DailyInterpretation,
    language:       'th' | 'en',
  ): GeneratedBrief {
    try {
      // Extract JSON block from response
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON in response');
      const p = JSON.parse(jsonMatch[0]);

      return {
        headlineThai: p.headline     || interpretation.headline,
        headlineEn:   p.headline     || interpretation.headlineEn,
        overviewThai: p.overview     || '',
        overviewEn:   p.overview     || '',
        transitReadings: (p.transits || []).map((t: any, i: number) => {
          const rule = interpretation.activeRules[i];
          const planetKey = rule?.id?.split('_')[0] ?? 'SURYA';
          return {
            planet:         planetKey,
            planetEmoji:    PLANET_EMOJIS[planetKey] ?? '⭐',
            titleThai:      t.title   || rule?.titleThai   || '',
            titleEn:        t.title   || rule?.titleEn     || '',
            bodyThai:       `${t.body || ''} ${t.advice || ''}`.trim(),
            bodyEn:         `${t.body || ''} ${t.advice || ''}`.trim(),
            intensityLevel: rule?.intensity ?? 3,
            quality:        (rule?.category === 'caution' || rule?.category === 'inauspicious')
                              ? 'malefic' : 'benefic',
            accentColor:    QUALITY_COLORS[rule?.category ?? 'career'] ?? '#D4A017',
          };
        }),
        closingThai:  p.closing    || 'ขอให้วันนี้เป็นวันที่ดีของท่าน',
        closingEn:    p.closing    || 'May today be a good day for you.',
        generatedAt:  new Date(),
        cacheKey:     '',
      };
    } catch {
      return this.generateFallbackBrief(interpretation, {} as DailyAstroData, language);
    }
  }

  // ── OUTPUT VALIDATION ─────────────────────────────────────────────

  private static validateOutput(brief: GeneratedBrief): boolean {
    if (!brief.headlineThai || brief.headlineThai.length < 5)  return false;
    if (!brief.overviewThai || brief.overviewThai.length < 20) return false;
    if (!brief.transitReadings || brief.transitReadings.length === 0) return false;
    return true;
  }

  // ── FALLBACK TEMPLATE ─────────────────────────────────────────────

  static generateFallbackBrief(
    interpretation: DailyInterpretation,
    _astroData: DailyAstroData,
    language: 'th' | 'en',
  ): GeneratedBrief {
    const isThai = language === 'th';
    return {
      headlineThai: interpretation.headline,
      headlineEn:   interpretation.headlineEn,
      overviewThai: `วันนี้มีพลังงาน${interpretation.overallQualityThai} ${interpretation.wanGerdMessage ?? ''}`.trim(),
      overviewEn:   `Today's energy is ${interpretation.overallQuality}. ${interpretation.wanGerdMessage ?? ''}`.trim(),
      transitReadings: interpretation.activeRules.slice(0, 4).map(r => {
        const planetKey = r.id.split('_')[0];
        return {
          planet:         planetKey,
          planetEmoji:    PLANET_EMOJIS[planetKey] ?? '⭐',
          titleThai:      r.titleThai,
          titleEn:        r.titleEn,
          bodyThai:       `${r.descriptionThai} ${r.adviceThai}`.trim(),
          bodyEn:         `${r.descriptionEn} ${r.adviceEn}`.trim(),
          intensityLevel: r.intensity,
          quality:        (r.category === 'caution' || r.category === 'inauspicious')
                            ? 'malefic' : 'benefic',
          accentColor:    QUALITY_COLORS[r.category] ?? '#D4A017',
        };
      }),
      closingThai:  'ขอให้ดาวฟ้าคุ้มครองท่านตลอดวัน',
      closingEn:    'May the stars watch over you today.',
      generatedAt:  new Date(),
      cacheKey:     'fallback',
    };
  }

  // ── CACHE LAYER ───────────────────────────────────────────────────

  private static buildCacheKey(
    interpretation: DailyInterpretation,
    _astroData:     DailyAstroData,
  ): string {
    const date    = new Date().toISOString().split('T')[0];
    const quality = interpretation.overallQuality;
    const ruleIds = interpretation.activeRules.map(r => r.id).sort().join(',');
    return `brief_${date}_${quality}_${ruleIds.substring(0, 40)}`;
  }

  static async checkCache(key: string): Promise<GeneratedBrief | null> {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const stored = await AsyncStorage.getItem(key);
      if (!stored) return null;
      const parsed = JSON.parse(stored) as GeneratedBrief;
      // 6-hour TTL
      const age = Date.now() - new Date(parsed.generatedAt).getTime();
      return age < 6 * 60 * 60 * 1000 ? parsed : null;
    } catch {
      return null;
    }
  }

  private static async cacheResult(key: string, brief: GeneratedBrief): Promise<void> {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.setItem(key, JSON.stringify({...brief, cacheKey: key}));
    } catch {}
  }
}
