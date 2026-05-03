import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic();

// ─── System prompt ────────────────────────────────────────────────

const SYSTEM_PROMPT = `คุณเป็นผู้เชี่ยวชาญโหงวเฮ้ง (五行相法) — ศาสตร์การอ่านใบหน้าตามหลักธาตุทั้ง 5 ของจีน-ไทย
วิเคราะห์ใบหน้าจากรูปภาพที่ได้รับ แล้วตอบเป็น JSON เท่านั้น ห้ามมีข้อความอื่นนอกจาก JSON

ธาตุทั้ง 5 (Wu Xing / โหงวเฮ้ง):
- ไม้ (木 Wood): หน้ายาวรูปรี ความคิดสร้างสรรค์ การเติบโต
- ไฟ (火 Fire): หน้าสามเหลี่ยมหัวกลับ ความทะเยอทะยาน ความกล้า
- ดิน (土 Earth): หน้าสี่เหลี่ยม ความมั่นคง ความน่าเชื่อถือ
- ทอง (金 Metal): หน้ากลมหรือเหลี่ยมกว้าง ระเบียบวินัย ความยุติธรรม
- น้ำ (水 Water): หน้ากลมอิ่มเอิบ ปัญญา ความลึกซึ้ง

โซนใบหน้า 5 โซน:
1. หน้าผาก (ไฟ) — การงาน วัยหนุ่มสาว อายุ 15-30
2. คิ้ว (ไม้) — พี่น้อง ความสัมพันธ์ อายุ 31-35
3. ตา (ทอง) — ทรัพย์สิน สุขภาพ อายุ 35-40
4. จมูก (ดิน) — ตัวตน ความมั่งคั่ง อายุ 41-50
5. ปาก/คาง (น้ำ) — ครอบครัว วัยชรา อายุ 51-70

ตอบในรูปแบบ JSON นี้เสมอ:
{
  "dominantElement": "wood|fire|earth|metal|water",
  "elementNameThai": "ชื่อธาตุภาษาไทย",
  "elementSymbol": "🌿|🔥|🌍|⚜️|💧",
  "elementColor": "#hexcolor",
  "overallScore": 0-100,
  "overallQualityThai": "ดีเยี่ยม|ดี|สมดุล|ปานกลาง|ต้องเสริม",
  "headline": "ประโยคสรุปหลัก",
  "summaryThai": "อธิบาย 2-3 ประโยค",
  "faceShapeObservation": "สิ่งที่สังเกตเห็นจากรูปทรงใบหน้า",
  "zones": {
    "forehead": { "observationThai": "...", "score": 1-10, "quality": "auspicious|neutral|challenging" },
    "brows":    { "observationThai": "...", "score": 1-10, "quality": "auspicious|neutral|challenging" },
    "eyes":     { "observationThai": "...", "score": 1-10, "quality": "auspicious|neutral|challenging" },
    "nose":     { "observationThai": "...", "score": 1-10, "quality": "auspicious|neutral|challenging" },
    "mouth":    { "observationThai": "...", "score": 1-10, "quality": "auspicious|neutral|challenging" }
  },
  "strengthsThai": ["จุดแข็ง 1", "จุดแข็ง 2", "จุดแข็ง 3"],
  "challengesThai": ["สิ่งที่ต้องระวัง 1", "สิ่งที่ต้องระวัง 2"],
  "luckyColorThai": "ชื่อสีมงคล",
  "luckyColorHex": "#hexcolor",
  "luckyNumber": 1-9,
  "luckyDirectionThai": "ทิศมงคล",
  "compatibleElementsThai": ["ธาตุเกื้อกูล 1", "ธาตุเกื้อกูล 2"],
  "careerAdviceThai": "แนะนำอาชีพ",
  "wealthAdviceThai": "แนะนำเรื่องทรัพย์",
  "healthAdviceThai": "แนะนำสุขภาพ"
}`;

// ─── Route handler ─────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { imageBase64: string; mediaType: string };
    const { imageBase64, mediaType } = body;

    if (!imageBase64 || !mediaType) {
      return NextResponse.json({ error: 'imageBase64 and mediaType required' }, { status: 400 });
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(mediaType)) {
      return NextResponse.json({ error: 'Unsupported image type' }, { status: 400 });
    }

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text: 'วิเคราะห์โหงวเฮ้งจากใบหน้าในรูปภาพนี้ ตอบเป็น JSON เท่านั้น',
            },
          ],
        },
      ],
    });

    const rawText = response.content[0].type === 'text' ? response.content[0].text : '';

    // Extract JSON even if the model wrapped it in markdown
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Invalid response from AI', raw: rawText }, { status: 500 });
    }

    const reading = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ reading, inputTokens: response.usage.input_tokens });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
