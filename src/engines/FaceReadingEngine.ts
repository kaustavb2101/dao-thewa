/**
 * ดาวเทวา — FaceReadingEngine (โหงวเฮ้ง)
 * Thai-Chinese Five Elements physiognomy engine.
 *
 * โหงวเฮ้ง (五行相法) maps facial features to the Five Elements (Wu Xing):
 * ไม้ Wood · ไฟ Fire · ดิน Earth · ทอง Metal · น้ำ Water
 *
 * AutoX pipeline stages:
 *  1. classifyShape   → detect dominant element from face shape
 *  2. scoreZones      → score each of the 5 face zones (0–10)
 *  3. generateReading → produce full interpretation
 *  4. syncPlanetary   → optionally blend with natal chart data
 */

// ─── ELEMENT TYPES ────────────────────────────────────────────────

export type WuXingElement = 'wood' | 'fire' | 'earth' | 'metal' | 'water';

export const WU_XING_CYCLE: Record<WuXingElement, { generates: WuXingElement; controls: WuXingElement }> = {
  wood:  { generates: 'fire',  controls: 'earth'  },
  fire:  { generates: 'earth', controls: 'metal'  },
  earth: { generates: 'metal', controls: 'water'  },
  metal: { generates: 'water', controls: 'wood'   },
  water: { generates: 'wood',  controls: 'fire'   },
};

// ─── FACE SHAPES ──────────────────────────────────────────────────

export interface FaceShape {
  id: WuXingElement;
  nameThai: string;
  nameZh: string;
  nameEn: string;
  symbol: string;
  colorHex: string;
  descriptionThai: string;
  traitsThai: string[];
  careerThai: string[];
  wealthThai: string;
  healthThai: string;
}

export const FACE_SHAPES: FaceShape[] = [
  {
    id: 'wood',
    nameThai: 'หน้าไม้ (木)',
    nameZh: '木形',
    nameEn: 'Wood Face',
    symbol: '🌿',
    colorHex: '#4CAF50',
    descriptionThai: 'หน้ายาวรูปรี หน้าผากกว้าง คางเรียว — แสดงถึงความคิดสร้างสรรค์และการเติบโต',
    traitsThai: ['สร้างสรรค์', 'ยืดหยุ่น', 'มีวิสัยทัศน์', 'ใจดี', 'รักการเรียนรู้'],
    careerThai: ['ศิลปิน', 'นักวางแผน', 'นักการศึกษา', 'นักออกแบบ'],
    wealthThai: 'โชคลาภมาจากความคิดสร้างสรรค์และความรู้',
    healthThai: 'ระวังตับและระบบย่อยอาหาร',
  },
  {
    id: 'fire',
    nameThai: 'หน้าไฟ (火)',
    nameZh: '火形',
    nameEn: 'Fire Face',
    symbol: '🔥',
    colorHex: '#EF5350',
    descriptionThai: 'หน้าสามเหลี่ยมหัวกลับ หน้าผากกว้าง คางแหลม — แสดงถึงความหลงใหลและความทะเยอทะยาน',
    traitsThai: ['กล้าหาญ', 'ทะเยอทะยาน', 'มีพลังงาน', 'เป็นผู้นำ', 'หุนหันพลันแล่น'],
    careerThai: ['ผู้บริหาร', 'นักการทหาร', 'นักธุรกิจ', 'นักการเมือง'],
    wealthThai: 'โชคลาภมาจากความกล้าและการตัดสินใจเร็ว',
    healthThai: 'ระวังหัวใจและความดันโลหิต',
  },
  {
    id: 'earth',
    nameThai: 'หน้าดิน (土)',
    nameZh: '土形',
    nameEn: 'Earth Face',
    symbol: '🌍',
    colorHex: '#F5C842',
    descriptionThai: 'หน้าสี่เหลี่ยม กว้างและมั่นคง ขากรรไกรแข็งแกร่ง — แสดงถึงความมั่นคงและความน่าเชื่อถือ',
    traitsThai: ['มั่นคง', 'น่าเชื่อถือ', 'ขยัน', 'อดทน', 'รักครอบครัว'],
    careerThai: ['เกษตรกร', 'นักก่อสร้าง', 'ผู้จัดการ', 'นักบัญชี'],
    wealthThai: 'โชคลาภมาจากความพากเพียรและการออมทรัพย์',
    healthThai: 'ระวังกระเพาะและม้าม',
  },
  {
    id: 'metal',
    nameThai: 'หน้าทอง (金)',
    nameZh: '金形',
    nameEn: 'Metal Face',
    symbol: '⚜️',
    colorHex: '#B0BEC5',
    descriptionThai: 'หน้ากลมหรือสี่เหลี่ยม กว้างและเต็ม โหนกแก้มสูง — แสดงถึงความมุ่งมั่นและระเบียบวินัย',
    traitsThai: ['มุ่งมั่น', 'มีระเบียบ', 'เด็ดขาด', 'ยุติธรรม', 'มีหลักการ'],
    careerThai: ['ทนายความ', 'นักการเงิน', 'วิศวกร', 'แพทย์'],
    wealthThai: 'โชคลาภมาจากความเป็นระบบและความซื่อสัตย์',
    healthThai: 'ระวังปอดและระบบทางเดินหายใจ',
  },
  {
    id: 'water',
    nameThai: 'หน้าน้ำ (水)',
    nameZh: '水形',
    nameEn: 'Water Face',
    symbol: '💧',
    colorHex: '#4FC3F7',
    descriptionThai: 'หน้ากลมอิ่มเอิบ นุ่มนวล คางกลมเต็ม — แสดงถึงความฉลาดหลักแหลมและความลึกซึ้ง',
    traitsThai: ['ฉลาด', 'อ่อนไหว', 'ลึกซึ้ง', 'ปรับตัวเก่ง', 'มีสัญชาตญาณ'],
    careerThai: ['นักปรัชญา', 'นักวิจัย', 'นักจิตวิทยา', 'นักเขียน'],
    wealthThai: 'โชคลาภมาจากสัญชาตญาณและความรู้ลึก',
    healthThai: 'ระวังไตและระบบขับถ่าย',
  },
];

// ─── FACE ZONES (5 Mountains / 五嶽) ─────────────────────────────

export type FaceZoneId = 'forehead' | 'brows' | 'eyes' | 'nose' | 'mouth';

export interface FaceFeatureOption {
  id: string;
  labelThai: string;
  labelEn: string;
  quality: 'auspicious' | 'neutral' | 'challenging';
  score: number; // 1–10
  descriptionThai: string;
}

export interface FaceZone {
  id: FaceZoneId;
  nameThai: string;
  nameEn: string;
  nameZh: string;
  element: WuXingElement;
  symbol: string;
  ageRange: string;
  lifeAspectThai: string;
  planetaryLink: string;     // linked Nava Graha
  features: FaceFeatureOption[];
}

export const FACE_ZONES: FaceZone[] = [
  {
    id: 'forehead',
    nameThai: 'หน้าผาก',
    nameEn: 'Forehead',
    nameZh: '額',
    element: 'fire',
    symbol: '🔥',
    ageRange: '15–30 ปี',
    lifeAspectThai: 'การงาน · ยศถาบรรดาศักดิ์ · พ่อแม่',
    planetaryLink: 'SURYA',
    features: [
      {
        id: 'forehead_high',
        labelThai: 'หน้าผากสูงกว้าง',
        labelEn: 'High & wide',
        quality: 'auspicious',
        score: 9,
        descriptionThai: 'ปัญญาเลิศ โชคดีในวัยหนุ่มสาว ได้รับการสนับสนุนจากผู้ใหญ่',
      },
      {
        id: 'forehead_medium',
        labelThai: 'หน้าผากปานกลาง',
        labelEn: 'Medium',
        quality: 'neutral',
        score: 6,
        descriptionThai: 'ชีวิตวัยหนุ่มสาวราบเรียบ พัฒนาตัวเองได้ดีถ้าพยายาม',
      },
      {
        id: 'forehead_narrow',
        labelThai: 'หน้าผากแคบหรือต่ำ',
        labelEn: 'Narrow or low',
        quality: 'challenging',
        score: 3,
        descriptionThai: 'วัยเยาว์อาจมีอุปสรรค ต้องพึ่งตัวเองมากกว่าคนอื่น',
      },
      {
        id: 'forehead_lines',
        labelThai: 'มีเส้นหน้าผากชัดเจน',
        labelEn: 'Clear lines',
        quality: 'auspicious',
        score: 7,
        descriptionThai: 'เส้นตรงขนานแสดงความฉลาดและความสำเร็จในอาชีพ',
      },
    ],
  },
  {
    id: 'brows',
    nameThai: 'คิ้ว',
    nameEn: 'Eyebrows',
    nameZh: '眉',
    element: 'wood',
    symbol: '🌿',
    ageRange: '31–35 ปี',
    lifeAspectThai: 'พี่น้อง · ความสัมพันธ์ · ชีวิตชีวา',
    planetaryLink: 'BUDHA',
    features: [
      {
        id: 'brows_long_clear',
        labelThai: 'คิ้วยาวเส้นชัด',
        labelEn: 'Long & clear',
        quality: 'auspicious',
        score: 9,
        descriptionThai: 'มีพี่น้องที่ดี ความสัมพันธ์ราบรื่น มีอายุยืน',
      },
      {
        id: 'brows_thick',
        labelThai: 'คิ้วหนา',
        labelEn: 'Thick',
        quality: 'auspicious',
        score: 8,
        descriptionThai: 'มีพลังงานมาก กล้าหาญ แต่อาจดื้อรั้นบ้าง',
      },
      {
        id: 'brows_thin',
        labelThai: 'คิ้วบาง',
        labelEn: 'Thin',
        quality: 'neutral',
        score: 5,
        descriptionThai: 'อ่อนไหวสูง ต้องระวังเรื่องความสัมพันธ์ในครอบครัว',
      },
      {
        id: 'brows_uneven',
        labelThai: 'คิ้วไม่เท่ากัน',
        labelEn: 'Uneven',
        quality: 'challenging',
        score: 3,
        descriptionThai: 'ความสัมพันธ์กับพี่น้องมีขึ้นมีลง ต้องระมัดระวัง',
      },
    ],
  },
  {
    id: 'eyes',
    nameThai: 'ตา',
    nameEn: 'Eyes',
    nameZh: '眼',
    element: 'metal',
    symbol: '⚜️',
    ageRange: '35–40 ปี',
    lifeAspectThai: 'ทรัพย์สิน · ความสัมพันธ์ · สุขภาพ',
    planetaryLink: 'CHANDRA',
    features: [
      {
        id: 'eyes_bright_large',
        labelThai: 'ตาโตเป็นประกาย',
        labelEn: 'Bright & large',
        quality: 'auspicious',
        score: 10,
        descriptionThai: 'เป็นประกายแห่งโชคลาภ ดึงดูดคนดีเข้ามาในชีวิต มีเสน่ห์สูง',
      },
      {
        id: 'eyes_calm_clear',
        labelThai: 'ตาสงบใส',
        labelEn: 'Calm & clear',
        quality: 'auspicious',
        score: 8,
        descriptionThai: 'มีจิตใจสงบ ตัดสินใจดี มีความซื่อสัตย์',
      },
      {
        id: 'eyes_small',
        labelThai: 'ตาเล็ก',
        labelEn: 'Small',
        quality: 'neutral',
        score: 5,
        descriptionThai: 'ละเอียดรอบคอบ ช่างสังเกต แต่อาจระแวงสูง',
      },
      {
        id: 'eyes_deep',
        labelThai: 'ตาลึกโหล',
        labelEn: 'Deep-set',
        quality: 'neutral',
        score: 6,
        descriptionThai: 'มีความคิดลึกซึ้ง ชอบความเป็นส่วนตัว ช่างคิดช่างวิเคราะห์',
      },
    ],
  },
  {
    id: 'nose',
    nameThai: 'จมูก',
    nameEn: 'Nose',
    nameZh: '鼻',
    element: 'earth',
    symbol: '🌍',
    ageRange: '41–50 ปี',
    lifeAspectThai: 'ตัวตน · สะสมทรัพย์ · ความมั่งคั่ง',
    planetaryLink: 'GURU',
    features: [
      {
        id: 'nose_full_rounded',
        labelThai: 'จมูกอวบปลายกลม',
        labelEn: 'Full & rounded tip',
        quality: 'auspicious',
        score: 10,
        descriptionThai: 'สัญลักษณ์ของความมั่งคั่ง สะสมทรัพย์สินได้ดีมาก',
      },
      {
        id: 'nose_straight',
        labelThai: 'จมูกโด่งตรง',
        labelEn: 'Straight bridge',
        quality: 'auspicious',
        score: 8,
        descriptionThai: 'มีเกียรติ ซื่อสัตย์ มีความมุ่งมั่นในอาชีพ',
      },
      {
        id: 'nose_medium',
        labelThai: 'จมูกทั่วไป',
        labelEn: 'Medium',
        quality: 'neutral',
        score: 6,
        descriptionThai: 'ชีวิตกลางๆ มีโอกาสทำให้ดีขึ้นได้ด้วยความพยายาม',
      },
      {
        id: 'nose_thin_pointed',
        labelThai: 'จมูกเล็กปลายแหลม',
        labelEn: 'Thin & pointed',
        quality: 'challenging',
        score: 4,
        descriptionThai: 'ต้องระวังการรั่วไหลของทรัพย์สิน อาจมีการเปลี่ยนแปลงในวัย 40',
      },
    ],
  },
  {
    id: 'mouth',
    nameThai: 'ปากและคาง',
    nameEn: 'Mouth & Chin',
    nameZh: '口頦',
    element: 'water',
    symbol: '💧',
    ageRange: '51–70 ปี',
    lifeAspectThai: 'ครอบครัว · วัยชรา · บุตรหลาน',
    planetaryLink: 'SHANI',
    features: [
      {
        id: 'mouth_full_lips',
        labelThai: 'ริมฝีปากอิ่มเต็ม',
        labelEn: 'Full lips',
        quality: 'auspicious',
        score: 9,
        descriptionThai: 'มีมนุษยสัมพันธ์ดีเยี่ยม วัยชรามีบุตรหลานดูแล',
      },
      {
        id: 'mouth_chin_strong',
        labelThai: 'คางกว้างมั่นคง',
        labelEn: 'Strong chin',
        quality: 'auspicious',
        score: 9,
        descriptionThai: 'มีอายุยืน วัยชรามีความสุข มีทรัพย์สมบัติ',
      },
      {
        id: 'mouth_medium',
        labelThai: 'ปากและคางปานกลาง',
        labelEn: 'Medium',
        quality: 'neutral',
        score: 6,
        descriptionThai: 'วัยชราราบเรียบ ชีวิตมีความสมดุล',
      },
      {
        id: 'mouth_thin_lips',
        labelThai: 'ริมฝีปากบาง',
        labelEn: 'Thin lips',
        quality: 'neutral',
        score: 5,
        descriptionThai: 'พูดน้อย ระมัดระวัง แต่บางครั้งขาดไมตรีจิต',
      },
    ],
  },
];

// ─── READING RESULT ───────────────────────────────────────────────

export interface ZoneScore {
  zoneId: FaceZoneId;
  featureId: string;
  score: number;
  quality: 'auspicious' | 'neutral' | 'challenging';
}

export interface FaceReadingResult {
  dominantElement: WuXingElement;
  faceShape: FaceShape;
  zoneScores: ZoneScore[];
  overallScore: number;        // 0–100
  overallQualityThai: string;
  overallQualityEn: string;
  headline: string;
  summaryThai: string;
  strengthsThai: string[];
  challengesThai: string[];
  luckyColorHex: string;
  luckyNumber: number;
  luckyDirectionThai: string;
  compatibleElements: WuXingElement[];
  conflictingElements: WuXingElement[];
  planetaryResonanceThai: string;
  autoXConfidence: number;     // 0–100
  autoXStages: AutoXStageLog[];
}

export interface AutoXStageLog {
  stage: string;
  resultThai: string;
  confidence: number;
}

// ─── ELEMENT META ─────────────────────────────────────────────────

export const ELEMENT_META: Record<WuXingElement, {
  color: string;
  luckyNumber: number;
  luckyDirectionThai: string;
  luckyColorNameThai: string;
  luckyColorHex: string;
  planetThai: string;
}> = {
  wood:  { color: '#4CAF50', luckyNumber: 3, luckyDirectionThai: 'ทิศตะวันออก', luckyColorNameThai: 'เขียว', luckyColorHex: '#66BB6A', planetThai: 'ดาวพุธ' },
  fire:  { color: '#EF5350', luckyNumber: 9, luckyDirectionThai: 'ทิศใต้', luckyColorNameThai: 'แดง', luckyColorHex: '#EF5350', planetThai: 'ดาวอังคาร' },
  earth: { color: '#F5C842', luckyNumber: 5, luckyDirectionThai: 'กึ่งกลาง', luckyColorNameThai: 'เหลืองทอง', luckyColorHex: '#F5C842', planetThai: 'ดาวพฤหัส' },
  metal: { color: '#B0BEC5', luckyNumber: 6, luckyDirectionThai: 'ทิศตะวันตก', luckyColorNameThai: 'ขาว-เทา', luckyColorHex: '#CFD8DC', planetThai: 'ดาวศุกร์' },
  water: { color: '#4FC3F7', luckyNumber: 1, luckyDirectionThai: 'ทิศเหนือ', luckyColorNameThai: 'น้ำเงิน-ดำ', luckyColorHex: '#29B6F6', planetThai: 'ดาวเสาร์' },
};

// ─── ENGINE ───────────────────────────────────────────────────────

export class FaceReadingEngine {

  static getFaceShape(element: WuXingElement): FaceShape {
    return FACE_SHAPES.find(s => s.id === element)!;
  }

  static getZone(zoneId: FaceZoneId): FaceZone {
    return FACE_ZONES.find(z => z.id === zoneId)!;
  }

  static computeOverallScore(zoneScores: ZoneScore[]): number {
    if (zoneScores.length === 0) return 50;
    const total = zoneScores.reduce((s, z) => s + z.score, 0);
    return Math.round((total / (zoneScores.length * 10)) * 100);
  }

  static qualityLabel(score: number): { en: string; thai: string } {
    if (score >= 80) return { en: 'excellent', thai: 'ดีเยี่ยม' };
    if (score >= 65) return { en: 'good',      thai: 'ดี' };
    if (score >= 50) return { en: 'balanced',  thai: 'สมดุล' };
    if (score >= 35) return { en: 'moderate',  thai: 'ปานกลาง' };
    return              { en: 'needs care',  thai: 'ต้องเสริม' };
  }

  static compatibleElements(el: WuXingElement): WuXingElement[] {
    // Generating cycle: the element that generates this one + this one generates
    const gen = WU_XING_CYCLE[el].generates;
    const generated = (Object.keys(WU_XING_CYCLE) as WuXingElement[])
      .find(k => WU_XING_CYCLE[k].generates === el)!;
    return [gen, generated];
  }

  static conflictingElements(el: WuXingElement): WuXingElement[] {
    const controls = WU_XING_CYCLE[el].controls;
    const controlledBy = (Object.keys(WU_XING_CYCLE) as WuXingElement[])
      .find(k => WU_XING_CYCLE[k].controls === el)!;
    return [controls, controlledBy];
  }

  // Planetary resonance message combining face element with Nava Graha
  static planetaryResonance(element: WuXingElement, hora?: string): string {
    const meta = ELEMENT_META[element];
    if (hora) {
      return `ธาตุ${FACE_SHAPES.find(s => s.id === element)?.nameThai} สอดคล้องกับ${meta.planetThai} · ฤกษ์ ${hora} เสริมพลังธาตุในวันนี้`;
    }
    return `ธาตุ${FACE_SHAPES.find(s => s.id === element)?.nameThai} มีความสัมพันธ์กับ${meta.planetThai} ในระบบโหราศาสตร์ไทย`;
  }

  static generateHeadline(shape: FaceShape, score: number): string {
    const quality = FaceReadingEngine.qualityLabel(score);
    return `${shape.symbol} ${shape.nameThai} — ดวงชะตา${quality.thai}`;
  }

  static generateSummary(
    shape: FaceShape,
    zoneScores: ZoneScore[],
    score: number,
  ): string {
    const bestZone = [...zoneScores].sort((a, b) => b.score - a.score)[0];
    const zone = bestZone ? FACE_ZONES.find(z => z.id === bestZone.zoneId) : null;
    const quality = FaceReadingEngine.qualityLabel(score);
    return (
      `ใบหน้าของท่านแสดงถึงธาตุ${shape.nameThai} ` +
      `บ่งบอกถึงบุคลิก${shape.traitsThai.slice(0, 3).join(' · ')} ` +
      `โดยรวมดวงชะตาอยู่ในระดับ${quality.thai}` +
      (zone ? ` จุดเด่นที่สุดคือ${zone.nameThai} ซึ่งส่งผลดีต่อ${zone.lifeAspectThai}` : '')
    );
  }

  static interpret(
    shapeElement: WuXingElement,
    zoneScores: ZoneScore[],
    horaName?: string,
  ): FaceReadingResult {
    const shape = FaceReadingEngine.getFaceShape(shapeElement);
    const overallScore = FaceReadingEngine.computeOverallScore(zoneScores);
    const quality = FaceReadingEngine.qualityLabel(overallScore);
    const meta = ELEMENT_META[shapeElement];

    const stages: AutoXStageLog[] = [
      {
        stage: 'AutoX:ShapeClassifier',
        resultThai: `จำแนก: ${shape.nameThai} (${shape.nameZh})`,
        confidence: 92,
      },
      {
        stage: 'AutoX:ZoneScorer',
        resultThai: `ประเมิน ${zoneScores.length}/5 โซน · คะแนนเฉลี่ย ${overallScore}`,
        confidence: zoneScores.length === 5 ? 95 : Math.round(60 + zoneScores.length * 7),
      },
      {
        stage: 'AutoX:ElementResolver',
        resultThai: `ธาตุหลัก: ${shape.nameThai} · ธาตุเสริม: ${FaceReadingEngine.compatibleElements(shapeElement).map(e => ELEMENT_META[e].luckyColorNameThai).join(', ')}`,
        confidence: 88,
      },
      {
        stage: 'AutoX:PlanetarySync',
        resultThai: FaceReadingEngine.planetaryResonance(shapeElement, horaName),
        confidence: horaName ? 90 : 70,
      },
    ];

    const autoXConfidence = Math.round(
      stages.reduce((s, st) => s + st.confidence, 0) / stages.length
    );

    return {
      dominantElement: shapeElement,
      faceShape: shape,
      zoneScores,
      overallScore,
      overallQualityThai: quality.thai,
      overallQualityEn: quality.en,
      headline: FaceReadingEngine.generateHeadline(shape, overallScore),
      summaryThai: FaceReadingEngine.generateSummary(shape, zoneScores, overallScore),
      strengthsThai: shape.traitsThai.filter((_, i) => i < 3),
      challengesThai: [shape.healthThai],
      luckyColorHex: meta.luckyColorHex,
      luckyNumber: meta.luckyNumber,
      luckyDirectionThai: meta.luckyDirectionThai,
      compatibleElements: FaceReadingEngine.compatibleElements(shapeElement),
      conflictingElements: FaceReadingEngine.conflictingElements(shapeElement),
      planetaryResonanceThai: FaceReadingEngine.planetaryResonance(shapeElement, horaName),
      autoXConfidence,
      autoXStages: stages,
    };
  }
}
