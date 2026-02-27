/**
 * ดาวเทวา — Core Constants
 * Thai astrological data: Nava Graha, Rasi, Nakshatra, Deities
 */

// ─────────────────────────────────────────────
// Thai Nava Graha (9 Planets)
// ─────────────────────────────────────────────
export const NAVA_GRAHA = {
  SURYA:   { id: 0, nameThai: 'ดาวอาทิตย์', nameEn: 'Sun',     symbol: '☀️', color: '#E8880A', rulesDay: 0 },
  CHANDRA: { id: 1, nameThai: 'ดาวจันทร์',  nameEn: 'Moon',    symbol: '🌙', color: '#C8C8E0', rulesDay: 1 },
  MANGAL:  { id: 2, nameThai: 'ดาวอังคาร', nameEn: 'Mars',    symbol: '♂',  color: '#EF5350', rulesDay: 2 },
  BUDHA:   { id: 3, nameThai: 'ดาวพุธ',    nameEn: 'Mercury', symbol: '☿',  color: '#4FC3F7', rulesDay: 3 },
  GURU:    { id: 4, nameThai: 'ดาวพฤหัส', nameEn: 'Jupiter', symbol: '♃',  color: '#F5C842', rulesDay: 4 },
  SHUKRA:  { id: 5, nameThai: 'ดาวศุกร์',  nameEn: 'Venus',   symbol: '♀',  color: '#80CBC4', rulesDay: 5 },
  SHANI:   { id: 6, nameThai: 'ดาวเสาร์',  nameEn: 'Saturn',  symbol: '♄',  color: '#B0BEC5', rulesDay: 6 },
  RAHU:    { id: 7, nameThai: 'ราหู',       nameEn: 'Rahu',    symbol: '☊',  color: '#7E57C2', rulesDay: -1 },
  KETU:    { id: 8, nameThai: 'เกตุ',       nameEn: 'Ketu',    symbol: '☋',  color: '#AB47BC', rulesDay: -1 },
} as const;

export type GrahaKey = keyof typeof NAVA_GRAHA;

// ─────────────────────────────────────────────
// 12 Thai Zodiac Signs (Rasi)
// ─────────────────────────────────────────────
export const THAI_RASI = [
  { id: 0,  nameThai: 'ราศีเมษ',     nameEn: 'Aries',       symbol: '♈', animal: '🐏', startDeg: 0   },
  { id: 1,  nameThai: 'ราศีพฤษภ',    nameEn: 'Taurus',      symbol: '♉', animal: '🐂', startDeg: 30  },
  { id: 2,  nameThai: 'ราศีเมถุน',   nameEn: 'Gemini',      symbol: '♊', animal: '🐅', startDeg: 60  },
  { id: 3,  nameThai: 'ราศีกรกฎ',    nameEn: 'Cancer',      symbol: '♋', animal: '🐇', startDeg: 90  },
  { id: 4,  nameThai: 'ราศีสิงห์',   nameEn: 'Leo',         symbol: '♌', animal: '🐉', startDeg: 120 },
  { id: 5,  nameThai: 'ราศีกันย์',   nameEn: 'Virgo',       symbol: '♍', animal: '🐍', startDeg: 150 },
  { id: 6,  nameThai: 'ราศีตุลย์',   nameEn: 'Libra',       symbol: '♎', animal: '🐴', startDeg: 180 },
  { id: 7,  nameThai: 'ราศีพิจิก',   nameEn: 'Scorpio',     symbol: '♏', animal: '🐑', startDeg: 210 },
  { id: 8,  nameThai: 'ราศีธนู',     nameEn: 'Sagittarius', symbol: '♐', animal: '🐒', startDeg: 240 },
  { id: 9,  nameThai: 'ราศีมกร',     nameEn: 'Capricorn',   symbol: '♑', animal: '🐓', startDeg: 270 },
  { id: 10, nameThai: 'ราศีกุมภ์',   nameEn: 'Aquarius',    symbol: '♒', animal: '🐕', startDeg: 300 },
  { id: 11, nameThai: 'ราศีมีน',     nameEn: 'Pisces',      symbol: '♓', animal: '🐖', startDeg: 330 },
] as const;

export type ThaiRasi = typeof THAI_RASI[number];

// ─────────────────────────────────────────────
// 27 Nakshatras (Lunar Mansions)
// ─────────────────────────────────────────────
export const NAKSHATRAS = [
  { id: 0,  nameThai: 'อัศวินี',   nameEn: 'Ashvini',           ruler: 'KETU',    startDeg: 0      },
  { id: 1,  nameThai: 'ภรณี',      nameEn: 'Bharani',           ruler: 'SHUKRA',  startDeg: 13.33  },
  { id: 2,  nameThai: 'กฤตติกา',   nameEn: 'Krittika',         ruler: 'SURYA',   startDeg: 26.67  },
  { id: 3,  nameThai: 'โรหิณี',   nameEn: 'Rohini',            ruler: 'CHANDRA', startDeg: 40     },
  { id: 4,  nameThai: 'มฤคศิร',   nameEn: 'Mrigashira',        ruler: 'MANGAL',  startDeg: 53.33  },
  { id: 5,  nameThai: 'อารทรา',   nameEn: 'Ardra',             ruler: 'RAHU',    startDeg: 66.67  },
  { id: 6,  nameThai: 'ปุนรวสุ',  nameEn: 'Punarvasu',         ruler: 'GURU',    startDeg: 80     },
  { id: 7,  nameThai: 'ปุษยะ',    nameEn: 'Pushya',            ruler: 'SHANI',   startDeg: 93.33  },
  { id: 8,  nameThai: 'อาศเลษา',  nameEn: 'Ashlesha',          ruler: 'BUDHA',   startDeg: 106.67 },
  { id: 9,  nameThai: 'มฆา',      nameEn: 'Magha',             ruler: 'KETU',    startDeg: 120    },
  { id: 10, nameThai: 'ปูรวผล',   nameEn: 'Purva Phalguni',    ruler: 'SHUKRA',  startDeg: 133.33 },
  { id: 11, nameThai: 'อุตตรผล',  nameEn: 'Uttara Phalguni',   ruler: 'SURYA',   startDeg: 146.67 },
  { id: 12, nameThai: 'หัสตะ',    nameEn: 'Hasta',             ruler: 'CHANDRA', startDeg: 160    },
  { id: 13, nameThai: 'จิตรา',    nameEn: 'Chitra',            ruler: 'MANGAL',  startDeg: 173.33 },
  { id: 14, nameThai: 'สวาติ',    nameEn: 'Swati',             ruler: 'RAHU',    startDeg: 186.67 },
  { id: 15, nameThai: 'วิศาขา',   nameEn: 'Vishakha',          ruler: 'GURU',    startDeg: 200    },
  { id: 16, nameThai: 'อนุราธา',  nameEn: 'Anuradha',          ruler: 'SHANI',   startDeg: 213.33 },
  { id: 17, nameThai: 'เชษฐา',    nameEn: 'Jyeshtha',         ruler: 'BUDHA',   startDeg: 226.67 },
  { id: 18, nameThai: 'มูละ',     nameEn: 'Mula',              ruler: 'KETU',    startDeg: 240    },
  { id: 19, nameThai: 'ปูรวษาฒ',  nameEn: 'Purva Ashadha',     ruler: 'SHUKRA',  startDeg: 253.33 },
  { id: 20, nameThai: 'อุตตรษาฒ', nameEn: 'Uttara Ashadha',    ruler: 'SURYA',   startDeg: 266.67 },
  { id: 21, nameThai: 'ศรวณะ',    nameEn: 'Shravana',          ruler: 'CHANDRA', startDeg: 280    },
  { id: 22, nameThai: 'ธนิษฐา',   nameEn: 'Dhanishta',         ruler: 'MANGAL',  startDeg: 293.33 },
  { id: 23, nameThai: 'ศตภิษัช',  nameEn: 'Shatabhisha',       ruler: 'RAHU',    startDeg: 306.67 },
  { id: 24, nameThai: 'ปูรวภัทร', nameEn: 'Purva Bhadrapada',  ruler: 'GURU',    startDeg: 320    },
  { id: 25, nameThai: 'อุตตรภัทร',nameEn: 'Uttara Bhadrapada', ruler: 'SHANI',   startDeg: 333.33 },
  { id: 26, nameThai: 'เรวดี',    nameEn: 'Revati',            ruler: 'BUDHA',   startDeg: 346.67 },
] as const;

export type Nakshatra = typeof NAKSHATRAS[number];

// ─────────────────────────────────────────────
// 8 Thai Day Deities (Wan Gerd)
// ─────────────────────────────────────────────
export const WAN_GERD_DEITIES: Record<number, {
  nameThai: string;
  nameEn: string;
  color: string;
  gemstone: string;
  luckyDir: string;
}> = {
  0: { nameThai: 'พระอาทิตย์',    nameEn: 'Phra Athit',            color: '#E8880A', gemstone: 'Ruby',             luckyDir: 'East'  },
  1: { nameThai: 'พระจันทร์',     nameEn: 'Phra Chan',             color: '#C8C8E0', gemstone: 'Pearl',            luckyDir: 'NW'    },
  2: { nameThai: 'พระอังคาร',     nameEn: 'Phra Angkhan',          color: '#EF5350', gemstone: 'Coral',            luckyDir: 'South' },
  3: { nameThai: 'พระพุธ',        nameEn: 'Phra Phut',             color: '#4FC3F7', gemstone: 'Emerald',          luckyDir: 'North' },
  4: { nameThai: 'พระพฤหัสบดี',  nameEn: 'Phra Phruehatsabodi',   color: '#F5C842', gemstone: 'Yellow Sapphire',  luckyDir: 'NE'    },
  5: { nameThai: 'พระศุกร์',      nameEn: 'Phra Suk',              color: '#80CBC4', gemstone: 'Diamond',          luckyDir: 'SE'    },
  6: { nameThai: 'พระเสาร์',      nameEn: 'Phra Sao',              color: '#B0BEC5', gemstone: 'Sapphire',         luckyDir: 'West'  },
};

// ─────────────────────────────────────────────
// Hora (Planetary Hour) — Chaldean Sequence
// ─────────────────────────────────────────────
export const HORA_SEQUENCE: GrahaKey[] = [
  'SURYA', 'SHUKRA', 'BUDHA', 'CHANDRA', 'SHANI', 'GURU', 'MANGAL',
];

// ─────────────────────────────────────────────
// Calendar Constants
// ─────────────────────────────────────────────
export const BUDDHIST_ERA_OFFSET = 543;

export const BANGKOK_TIMEZONE = 'Asia/Bangkok';

export const DAILY_COMPUTATION_HOUR = 5;  // 05:30 Bangkok time
export const DAILY_COMPUTATION_MINUTE = 30;

export const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

// ─────────────────────────────────────────────
// Auspiciousness Score Thresholds
// ─────────────────────────────────────────────
export const AUSPICIOUSNESS = {
  VERY_AUSPICIOUS: { min: 80, label: 'ดีมาก', color: '#4CAF50' },
  AUSPICIOUS:      { min: 60, label: 'ดี',     color: '#8BC34A' },
  NEUTRAL:         { min: 40, label: 'กลาง',   color: '#FFC107' },
  CHALLENGING:     { min: 20, label: 'ระวัง',  color: '#FF9800' },
  VERY_CHALLENGING:{ min: 0,  label: 'ระวังมาก',color: '#F44336' },
} as const;

export type AuspiciousnessLevel = keyof typeof AUSPICIOUSNESS;
