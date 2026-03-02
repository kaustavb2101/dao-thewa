// /src/engines/ThaiRulesEngine.ts
import { PlanetPosition, Transit, LunarPhase, HoraHour, ThaiDate } from './AstronomicalEngine'
import { NAVA_GRAHA, THAI_RASI, WAN_GERD_DEITIES } from '../../config/constants'

// ─── RULE TYPES ───────────────────────────────────────────────────

export type RuleCategory =
  | 'career' | 'love' | 'health'
  | 'wealth' | 'travel' | 'family'
  | 'spirituality' | 'creativity' | 'caution'
  | 'auspicious' | 'inauspicious'

export type IntensityLevel = 1 | 2 | 3 | 4 | 5

export interface InterpretationRule {
  id: string
  condition: (data: RuleInputData) => boolean
  category: RuleCategory
  intensity: IntensityLevel
  titleThai: string
  titleEn: string
  descriptionThai: string
  descriptionEn: string
  adviceThai: string
  adviceEn: string
  luckyColor?: string
  luckyNumber?: number
  avoidThai?: string
}

export interface RuleInputData {
  planets: PlanetPosition[]
  transits: Transit[]
  lunarPhase: LunarPhase
  currentHora: HoraHour
  thaiDate: ThaiDate
  wanGerd: number              // day of birth 0–6
  birthRasi: number            // natal sun sign 0–11
  birthNakshatra: number       // natal nakshatra 0–26
  horaHours?: HoraHour[]
}

export interface DailyInterpretation {
  headline: string             // Thai headline for the day
  headlineEn: string
  overallEnergy: IntensityLevel
  overallQuality: 'very auspicious' | 'auspicious' | 'neutral' | 'challenging' | 'very challenging'
  overallQualityThai: string
  activeRules: InterpretationRule[]
  wanGerdMessage: string       // Personal day-of-birth message
  horaMessage: string          // Current planetary hour advice
  lunarMessage: string         // Lunar phase guidance
  luckyDetails: {
    colors: string[]
    numbers: number[]
    directions: string[]
    gemstones: string[]
    auspiciousHours: string[]
  }
  avoidances: string[]         // What to avoid today
  rawDataForAI: object         // Structured data sent to Claude API
}

// ─── THE RULES ENGINE ─────────────────────────────────────────────

export class ThaiRulesEngine {

  private static rules: InterpretationRule[] = [

    // ══════════════════════════════════════════
    // GURU (JUPITER) RULES — expansion, luck
    // ══════════════════════════════════════════
    {
      id: 'GURU_TRINE_SURYA',
      condition: (d) => d.transits.some(t =>
        t.transitingPlanet === 'GURU' && t.natalPlanet === 'SURYA' && t.aspect === 'trine'
      ),
      category: 'career',
      intensity: 5,
      titleThai: 'พฤหัสสามเหลี่ยมอาทิตย์ — โชคลาภสูงสุด',
      titleEn: 'Jupiter trine natal Sun — Peak Fortune',
      descriptionThai: 'ฤกษ์มงคลที่หาได้ยาก ดาวพฤหัสบดีโคจรสามเหลี่ยมกับดวงอาทิตย์เกิด เปิดประตูแห่งโอกาสและการยอมรับจากสังคม',
      descriptionEn: 'A rare auspicious alignment. Jupiter trines your natal Sun, opening doors of opportunity and social recognition.',
      adviceThai: 'วันนี้เหมาะสำหรับการยื่นโปรเจกต์ ขอเลื่อนตำแหน่ง หรือเริ่มต้นธุรกิจใหม่',
      adviceEn: 'Today is ideal for presenting projects, seeking promotion, or launching new ventures.',
      luckyColor: '#F5C842',
      luckyNumber: 3,
    },

    {
      id: 'GURU_CONJUNCTION_CHANDRA',
      condition: (d) => d.transits.some(t =>
        t.transitingPlanet === 'GURU' && t.natalPlanet === 'CHANDRA' && t.aspect === 'conjunction'
      ),
      category: 'wealth',
      intensity: 4,
      titleThai: 'พฤหัสสมพงษ์จันทร์ — โชคทางการเงิน',
      titleEn: 'Jupiter conjunct natal Moon — Financial Fortune',
      descriptionThai: 'ดาวพฤหัสบดีประชุมกับดวงจันทร์เกิด นำพาความอุดมสมบูรณ์และโชคลาภทางการเงิน',
      descriptionEn: 'Jupiter conjuncts your natal Moon, bringing abundance and financial opportunity.',
      adviceThai: 'เหมาะสำหรับการลงทุนระยะยาวและการออมทรัพย์',
      adviceEn: 'Favorable for long-term investments and savings decisions.',
      luckyColor: '#FFD700',
      luckyNumber: 7,
    },

    {
      id: 'GURU_SQUARE_SHANI',
      condition: (d) => d.transits.some(t =>
        t.transitingPlanet === 'GURU' && t.natalPlanet === 'SHANI' && t.aspect === 'square'
      ),
      category: 'caution',
      intensity: 3,
      titleThai: 'พฤหัสตั้งฉากเสาร์ — ระวังการตัดสินใจ',
      titleEn: 'Jupiter square natal Saturn — Decision Tension',
      descriptionThai: 'แรงกดดันระหว่างการขยายตัวและข้อจำกัด อาจเผชิญกับการตัดสินใจที่ยากลำบาก',
      descriptionEn: 'Tension between expansion and limitation. Difficult decisions may arise.',
      adviceThai: 'อย่าเร่งรีบ ใช้เวลาไตร่ตรองก่อนตัดสินใจสำคัญ',
      adviceEn: 'Do not rush. Take time to reflect before major decisions.',
      luckyColor: '#8B6914',
      luckyNumber: 8,
      avoidThai: 'หลีกเลี่ยงการลงนามในสัญญาสำคัญ',
    },

    // ══════════════════════════════════════════
    // SHUKRA (VENUS) RULES — love, beauty
    // ══════════════════════════════════════════
    {
      id: 'SHUKRA_TRINE_CHANDRA',
      condition: (d) => d.transits.some(t =>
        t.transitingPlanet === 'SHUKRA' && t.natalPlanet === 'CHANDRA' && t.aspect === 'trine'
      ),
      category: 'love',
      intensity: 5,
      titleThai: 'ศุกร์สามเหลี่ยมจันทร์ — ความรักสมหวัง',
      titleEn: 'Venus trine natal Moon — Love Fulfilled',
      descriptionThai: 'ดาวศุกร์โคจรสามเหลี่ยมกับดวงจันทร์เกิด นำพาความรักและความสัมพันธ์ที่ราบรื่น หัวใจเปิดกว้าง',
      descriptionEn: 'Venus trines your natal Moon. Love flows easily. Relationships deepen naturally.',
      adviceThai: 'วันนี้เหมาะสำหรับการสารภาพรัก นัดพบ หรือเสริมสร้างความสัมพันธ์',
      adviceEn: 'Perfect day for confessing feelings, dates, or strengthening relationships.',
      luckyColor: '#FF69B4',
      luckyNumber: 6,
    },

    {
      id: 'SHUKRA_OPPOSITION_MANGAL',
      condition: (d) => d.transits.some(t =>
        t.transitingPlanet === 'SHUKRA' && t.natalPlanet === 'MANGAL' && t.aspect === 'opposition'
      ),
      category: 'love',
      intensity: 3,
      titleThai: 'ศุกร์ตรงข้ามอังคาร — ความตึงเครียดในความสัมพันธ์',
      titleEn: 'Venus opposite natal Mars — Relationship Friction',
      descriptionThai: 'แรงดึงดูดและความขัดแย้งในเวลาเดียวกัน ความสัมพันธ์อาจเต็มไปด้วยอารมณ์',
      descriptionEn: 'Attraction and conflict coexist. Relationships may be emotionally charged.',
      adviceThai: 'ฟังอีกฝ่ายด้วยความอดทน หลีกเลี่ยงการเผชิญหน้า',
      adviceEn: 'Listen patiently. Avoid confrontations.',
      luckyColor: '#FF6B6B',
      luckyNumber: 9,
      avoidThai: 'หลีกเลี่ยงการโต้เถียงกับคนรัก',
    },

    // ══════════════════════════════════════════
    // BUDHA (MERCURY) RULES — communication
    // ══════════════════════════════════════════
    {
      id: 'BUDHA_RETROGRADE',
      condition: (d) => d.planets.some(p => p.planet === 'BUDHA' && p.isRetrograde),
      category: 'caution',
      intensity: 4,
      titleThai: 'ดาวพุธถอยหลัง — ระวังการสื่อสาร',
      titleEn: 'Mercury Retrograde — Communication Alert',
      descriptionThai: 'ดาวพุธกำลังถอยหลัง เป็นช่วงเวลาที่ต้องระวังการสื่อสาร สัญญา และเทคโนโลยี',
      descriptionEn: 'Mercury is retrograde. Extra care needed in communication, contracts, and technology.',
      adviceThai: 'สำรองข้อมูล อ่านสัญญาอย่างละเอียด และยืนยันนัดหมายทุกครั้ง',
      adviceEn: 'Back up data, read contracts carefully, and confirm all appointments.',
      luckyColor: '#4FC3F7',
      luckyNumber: 5,
      avoidThai: 'หลีกเลี่ยงการเซ็นสัญญา เปิดตัวผลิตภัณฑ์ใหม่ และการตัดสินใจสำคัญ',
    },

    {
      id: 'BUDHA_TRINE_GURU',
      condition: (d) => d.transits.some(t =>
        t.transitingPlanet === 'BUDHA' && t.natalPlanet === 'GURU' && t.aspect === 'trine'
      ),
      category: 'career',
      intensity: 4,
      titleThai: 'พุธสามเหลี่ยมพฤหัส — สติปัญญาเปล่งประกาย',
      titleEn: 'Mercury trine natal Jupiter — Intellect Shines',
      descriptionThai: 'ความคิดและการสื่อสารอยู่ในระดับสูงสุด เหมาะสำหรับการเจรจา การเรียน และการนำเสนอ',
      descriptionEn: 'Thinking and communication peak. Ideal for negotiations, study, and presentations.',
      adviceThai: 'นำเสนอแนวคิดใหม่ๆ เจรจาต่อรอง หรือเรียนรู้สิ่งใหม่',
      adviceEn: 'Present new ideas, negotiate, or pursue new learning.',
      luckyColor: '#80CBC4',
      luckyNumber: 3,
    },

    // ══════════════════════════════════════════
    // SHANI (SATURN) RULES — karma, discipline
    // ══════════════════════════════════════════
    {
      id: 'SHANI_RETURN',
      condition: (d) => d.transits.some(t =>
        t.transitingPlanet === 'SHANI' && t.natalPlanet === 'SHANI' &&
        t.aspect === 'conjunction' && t.orb < 3
      ),
      category: 'spirituality',
      intensity: 5,
      titleThai: 'เสาร์กลับคืน — วงจรกรรมสำคัญ',
      titleEn: 'Saturn Return — Major Karmic Cycle',
      descriptionThai: 'วงจรดาวเสาร์ 29 ปี เป็นช่วงเวลาสำคัญที่สุดในชีวิต กรรมเก่าสิ้นสุด บทใหม่เริ่มต้น',
      descriptionEn: "Saturn's 29-year cycle. The most significant period of life. Old karma ends. New chapter begins.",
      adviceThai: 'ทบทวนชีวิตที่ผ่านมา ปล่อยวางสิ่งที่ไม่รับใช้อีกต่อไป และวางรากฐานใหม่ด้วยความตั้งใจ',
      adviceEn: 'Review your past, release what no longer serves you, and set new foundations with intention.',
      luckyColor: '#607D8B',
      luckyNumber: 8,
    },

    {
      id: 'SHANI_TRINE_SURYA',
      condition: (d) => d.transits.some(t =>
        t.transitingPlanet === 'SHANI' && t.natalPlanet === 'SURYA' && t.aspect === 'trine'
      ),
      category: 'career',
      intensity: 4,
      titleThai: 'เสาร์สามเหลี่ยมอาทิตย์ — ความสำเร็จระยะยาว',
      titleEn: 'Saturn trine natal Sun — Long-term Achievement',
      descriptionThai: 'ความพยายามที่สะสมมาเริ่มให้ผล วินัยและความมุ่งมั่นกำลังสร้างผลลัพธ์ที่ยั่งยืน',
      descriptionEn: 'Accumulated efforts begin to pay off. Discipline and commitment yield lasting results.',
      adviceThai: 'ทำงานอย่างมีระบบ วางแผนระยะยาว และอดทนกับกระบวนการ',
      adviceEn: 'Work systematically, plan long-term, and trust the process.',
      luckyColor: '#455A64',
      luckyNumber: 4,
    },

    // ══════════════════════════════════════════
    // SURYA (SUN) RULES — identity, vitality
    // ══════════════════════════════════════════
    {
      id: 'SURYA_IN_BIRTH_RASI',
      condition: (d) => {
        const sun = d.planets.find(p => p.planet === 'SURYA')
        return sun ? sun.rasi === d.birthRasi : false
      },
      category: 'auspicious',
      intensity: 4,
      titleThai: 'ดวงอาทิตย์อยู่ในราศีเกิด — พลังสูงสุด',
      titleEn: 'Sun in Birth Sign — Peak Vitality',
      descriptionThai: 'ดวงอาทิตย์โคจรผ่านราศีเกิดของท่าน นี่คือฤดูกาลแห่งพลังงานและอัตลักษณ์สูงสุด',
      descriptionEn: 'The Sun transits your birth sign. This is your season of peak energy and identity.',
      adviceThai: 'ใช้ประโยชน์จากพลังงานสูงนี้เพื่อเริ่มต้นโปรเจกต์สำคัญ',
      adviceEn: 'Harness this high energy to initiate important projects.',
      luckyColor: '#E8880A',
      luckyNumber: 1,
    },

    // ══════════════════════════════════════════
    // LUNAR PHASE RULES
    // ══════════════════════════════════════════
    {
      id: 'FULL_MOON_POWER',
      condition: (d) => d.lunarPhase.phase > 0.47 && d.lunarPhase.phase < 0.53,
      category: 'spirituality',
      intensity: 5,
      titleThai: 'จันทร์เต็มดวง — พลังสูงสุดแห่งเดือน',
      titleEn: 'Full Moon — Peak Power of the Month',
      descriptionThai: 'จันทร์เต็มดวงเปิดเผยความจริงและนำพลังงานสู่จุดสูงสุด อารมณ์อาจรุนแรงขึ้น แต่สัญชาตญาณก็แหลมคมขึ้นด้วย',
      descriptionEn: 'Full Moon reveals truth and peaks energy. Emotions may intensify but intuition sharpens.',
      adviceThai: 'ทำสมาธิ ปล่อยวางสิ่งที่ไม่ต้องการ และรับรู้ความจริงในชีวิต',
      adviceEn: 'Meditate, release what is no longer needed, and embrace truth.',
      luckyColor: '#FFFFFF',
      luckyNumber: 2,
    },

    {
      id: 'NEW_MOON_INTENTIONS',
      condition: (d) => d.lunarPhase.phase < 0.04 || d.lunarPhase.phase > 0.96,
      category: 'auspicious',
      intensity: 4,
      titleThai: 'จันทร์ดับ — เริ่มต้นบทใหม่',
      titleEn: 'New Moon — New Beginning',
      descriptionThai: 'จันทร์ดับเป็นช่วงเวลาแห่งการเริ่มต้นใหม่ พลังงานสร้างสรรค์อยู่ในจุดที่เข้มแข็งที่สุด',
      descriptionEn: 'New Moon is a time of fresh starts. Creative energy is at its most potent.',
      adviceThai: 'ตั้งเจตนาสำหรับเดือนที่กำลังจะมา เขียนเป้าหมาย และเริ่มต้นโปรเจกต์ใหม่',
      adviceEn: 'Set intentions for the coming month, write goals, and begin new projects.',
      luckyColor: '#1A1A2E',
      luckyNumber: 9,
    },

    // ══════════════════════════════════════════
    // WAN GERD (DAY OF BIRTH) RULES
    // ══════════════════════════════════════════
    {
      id: 'WAN_GERD_MATCH_TODAY',
      condition: (d) => d.wanGerd === d.thaiDate.wan,
      category: 'auspicious',
      intensity: 3,
      titleThai: 'วันเกิดตรงกับวันนี้ — พลังงานส่วนตัวสูง',
      titleEn: 'Birth Day Matches Today — Personal Energy Peak',
      descriptionThai: 'วันนี้ตรงกับวันเกิดของท่าน พลังงานส่วนตัวและโชคชะตาส่วนบุคคลอยู่ในระดับสูง',
      descriptionEn: "Today matches your birth day. Personal energy and individual fortune are elevated.",
      adviceThai: 'ทำสิ่งที่ท่านรักและสิ่งที่สำคัญที่สุดสำหรับตัวเองในวันนี้',
      adviceEn: 'Do what you love and what matters most to you personally today.',
      luckyColor: '#D4A017',
      luckyNumber: 5,
    },

    {
      id: 'WAN_GERD_OPPOSITE',
      condition: (d) => Math.abs(d.wanGerd - d.thaiDate.wan) === 3,
      category: 'caution',
      intensity: 2,
      titleThai: 'วันตรงข้ามวันเกิด — ระวังเล็กน้อย',
      titleEn: 'Opposite Birth Day — Mild Caution',
      descriptionThai: 'วันนี้อยู่ตรงข้ามกับวันเกิด อาจรู้สึกเหนื่อยล้าหรือหลุดโฟกัสได้ง่าย',
      descriptionEn: 'Today opposes your birth day. You may feel slightly off-center or fatigued.',
      adviceThai: 'พักผ่อนให้เพียงพอและอย่าฝืนร่างกาย',
      adviceEn: 'Rest well and do not push your body too hard.',
      luckyColor: '#607D8B',
      luckyNumber: 6,
    },

    // ══════════════════════════════════════════
    // HORA RULES (current planetary hour)
    // ══════════════════════════════════════════
    {
      id: 'HORA_GURU',
      condition: (d) => d.currentHora.planet === 'GURU',
      category: 'auspicious',
      intensity: 3,
      titleThai: 'ฤกษ์ดาวพฤหัสบดี — ชั่วโมงแห่งโชค',
      titleEn: 'Jupiter Hour — Hour of Fortune',
      descriptionThai: "ชั่วโมงนี้อยู่ภายใต้อิทธิพลของดาวพฤหัสบดี เทพแห่งโชคลาภและปัญญา",
      descriptionEn: "This hour is under Jupiter's influence, deity of fortune and wisdom.",
      adviceThai: 'เหมาะสำหรับการขอความช่วยเหลือ การเรียนรู้ และการขยายกิจการ',
      adviceEn: 'Ideal for seeking assistance, learning, and expanding ventures.',
      luckyColor: '#F5C842',
      luckyNumber: 3,
    },

    {
      id: 'HORA_SHANI',
      condition: (d) => d.currentHora.planet === 'SHANI',
      category: 'caution',
      intensity: 2,
      titleThai: 'ฤกษ์ดาวเสาร์ — ชั่วโมงแห่งความอดทน',
      titleEn: 'Saturn Hour — Hour of Patience',
      descriptionThai: "ชั่วโมงนี้อยู่ภายใต้อิทธิพลของดาวเสาร์ ชะลอตัวและใช้ความรอบคอบ",
      descriptionEn: "This hour is under Saturn's influence. Slow down and exercise caution.",
      adviceThai: 'เหมาะสำหรับงานที่ต้องการความละเอียดและความอดทน',
      adviceEn: 'Best for tasks requiring precision and patience.',
      luckyColor: '#607D8B',
      luckyNumber: 8,
    },

    // ══════════════════════════════════════════
    // RAHU / KETU SHADOW PLANET RULES
    // ══════════════════════════════════════════
    {
      id: 'RAHU_ECLIPSE_WINDOW',
      condition: (d) => {
        const sun = d.planets.find(p => p.planet === 'SURYA')
        const moon = d.planets.find(p => p.planet === 'CHANDRA')
        if (!sun || !moon) return false
        const diff = Math.abs(sun.longitude - moon.longitude)
        return diff < 15 || diff > 345
      },
      category: 'spirituality',
      intensity: 4,
      titleThai: 'หน้าต่างสุริยุปราคา — ช่วงเวลาแปรเปลี่ยน',
      titleEn: 'Eclipse Window — Transformation Period',
      descriptionThai: 'ดวงอาทิตย์และดวงจันทร์เคลื่อนใกล้กัน สร้างพลังงานแห่งการเปลี่ยนแปลงที่ทรงพลัง',
      descriptionEn: 'Sun and Moon converge, creating powerful transformation energy.',
      adviceThai: 'หลีกเลี่ยงการตัดสินใจสำคัญในช่วงนี้ แต่เปิดรับการเปลี่ยนแปลงที่มาเอง',
      adviceEn: 'Avoid major decisions but remain open to organic change.',
      luckyColor: '#4A148C',
      luckyNumber: 11,
      avoidThai: 'หลีกเลี่ยงพิธีกรรมสำคัญและการเริ่มต้นโปรเจกต์ใหม่',
    },

    // ══════════════════════════════════════════
    // WAN THONG CHAI (VICTORY DAY)
    // ══════════════════════════════════════════
    {
      id: 'WAN_THONG_CHAI',
      condition: (d) => d.thaiDate.isAuspicious,
      category: 'auspicious',
      intensity: 4,
      titleThai: 'วันธงชัย — วันแห่งชัยชนะ',
      titleEn: 'Wan Thong Chai — Victory Day',
      descriptionThai: 'เป็นวันที่เป็นมงคลที่สุดในรอบสัปดาห์ เหมาะสำหรับการประกอบพิธีมงคลและการเริ่มต้นใหม่',
      descriptionEn: 'The most auspicious day of the week. Ideal for ceremonies and new beginnings.',
      adviceThai: 'ลงมือทำแผนงานที่วางไว้ หรือทำบุญเพื่อเสริมสิริมงคล',
      adviceEn: 'Execute your plans or perform merit-making for blessing.',
      luckyColor: '#FFD700',
      luckyNumber: 1,
    }

  ]

  // ─── MAIN INTERPRETATION ENGINE ─────────────────────────────────

  static interpret(data: RuleInputData): DailyInterpretation {
    // Fire all rules against the data
    const activeRules = this.rules.filter(rule => {
      try { return rule.condition(data) } catch { return false }
    })

    // Calculate overall energy
    const totalIntensity = activeRules.reduce((sum, r) => sum + r.intensity, 0)
    const avgIntensity = activeRules.length > 0
      ? Math.round(totalIntensity / activeRules.length) as IntensityLevel
      : 3

    // Determine quality
    const beneficCount = activeRules.filter(r => r.category !== 'caution' && r.category !== 'inauspicious').length
    const maleficCount = activeRules.filter(r => r.category === 'caution' || r.category === 'inauspicious').length
    const ratio = beneficCount / (maleficCount + 1)

    const quality = ratio > 3
      ? { en: 'very auspicious' as const, thai: 'มงคลมาก' }
      : ratio > 1.5
        ? { en: 'auspicious' as const, thai: 'มงคล' }
        : ratio > 0.8
          ? { en: 'neutral' as const, thai: 'ปกติ' }
          : ratio > 0.4
            ? { en: 'challenging' as const, thai: 'ท้าทาย' }
            : { en: 'very challenging' as const, thai: 'ท้าทายมาก' }

    // Generate headline from strongest rule
    const strongest = [...activeRules].sort((a, b) => b.intensity - a.intensity)[0]

    // Wan Gerd personal message
    const deity = WAN_GERD_DEITIES[data.wanGerd as keyof typeof WAN_GERD_DEITIES]
    const wanGerdMessage = deity
      ? `${deity.nameThai}คุ้มครองท่านในวันนี้ ทิศมงคล: ${deity.luckyDir} อัญมณีเสริมดวง: ${deity.gemstone}`
      : 'เทพคุ้มครองดูแลท่านในวันนี้'

    // Hora message
    const horaMessage = `${data.currentHora.planetNameThai} — ${data.currentHora.meaningThai}`

    // Lunar message
    const lunarMessage = `${data.lunarPhase.phaseNameThai} · ${data.lunarPhase.illumination}% สว่าง`

    // Collect lucky details
    const luckyColors = [...new Set(activeRules.map(r => r.luckyColor).filter(Boolean) as string[])]
    const luckyNumbers = [...new Set(activeRules.map(r => r.luckyNumber).filter(Boolean) as number[])]
    const avoidances = activeRules.map(r => r.avoidThai).filter(Boolean) as string[]

    return {
      headline: strongest?.titleThai || 'วันแห่งความสมดุล',
      headlineEn: strongest?.titleEn || 'A Day of Balance',
      overallEnergy: avgIntensity,
      overallQuality: quality.en,
      overallQualityThai: quality.thai,
      activeRules,
      wanGerdMessage,
      horaMessage,
      lunarMessage,
      luckyDetails: {
        colors: luckyColors,
        numbers: luckyNumbers,
        directions: deity ? [deity.luckyDir] : [],
        gemstones: deity ? [deity.gemstone] : [],
        auspiciousHours: data.horaHours ? data.horaHours.filter(h => h.planet === 'GURU' || h.planet === 'SHUKRA').map(h =>
          `${h.startTime.getHours()}:${String(h.startTime.getMinutes()).padStart(2, '0')}`
        ) : [],
      },

      avoidances,
      rawDataForAI: {
        activeRuleCount: activeRules.length,
        quality: quality.en,
        qualityThai: quality.thai,
        topTransits: data.transits.slice(0, 5).map(t => ({
          description: `${t.transitingPlanet} ${t.aspect} natal ${t.natalPlanet}`,
          strength: t.strength,
          quality: t.quality,
          keywordsThai: t.keywordsThai,
        })),
        lunarPhase: data.lunarPhase.phaseNameThai,
        currentHora: data.currentHora.planetNameThai,
        wanGerd: data.wanGerd,
        birthRasi: THAI_RASI[data.birthRasi]?.nameThai,
        birthNakshatra: data.birthNakshatra,
      },
    }
  }

  // ── UPCOMING EVENTS (next 30 days) ──────────────────────────────

  static findUpcomingEvents(
    fromDate: Date,
    planets: PlanetPosition[],
    days: number = 30
  ): Array<{ date: Date; titleThai: string; titleEn: string; category: RuleCategory; intensity: IntensityLevel }> {
    // Check for major upcoming transits
    const events = []

    // Mercury retrograde check
    const mercury = planets.find(p => p.planet === 'BUDHA')
    if (mercury && mercury.speed > -0.1 && mercury.speed < 0.3) {
      events.push({
        date: new Date(fromDate.getTime() + 3 * 86400000),
        titleThai: 'ดาวพุธใกล้ถอยหลัง — เตรียมรับมือ',
        titleEn: 'Mercury approaching retrograde — Prepare',
        category: 'caution' as RuleCategory,
        intensity: 4 as IntensityLevel,
      })
    }

    return events
  }
}
