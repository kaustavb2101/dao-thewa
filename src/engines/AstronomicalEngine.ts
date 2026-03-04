// /src/engines/AstronomicalEngine.ts
import * as Astronomy from 'astronomy-engine'
import { DateTime } from 'luxon'
import { NAVA_GRAHA, THAI_RASI, NAKSHATRAS, HORA_SEQUENCE, BUDDHIST_ERA_OFFSET } from '../../config/constants'

export interface NatalChart {
  birthDate: Date
  birthLat: number
  birthLng: number
  birthTimezone: string
}

export interface PlanetPosition {
  planet: string
  longitude: number        // 0–360 ecliptic degrees
  latitude: number
  distance: number
  speed: number            // deg/day — negative = retrograde
  rasi: number             // 0–11 zodiac sign index
  rasiDegree: number       // degree within sign
  nakshatra: number        // 0–26
  nakshatraPada: number    // 1–4
  isRetrograde: boolean
  nameThai: string
  nameEn: string
  symbol: string
}

export interface LunarPhase {
  phase: number            // 0–1 (0=new, 0.5=full)
  phaseName: string
  phaseNameThai: string
  illumination: number     // 0–100%
  thaiLunarDay: number     // 1–15 (waxing) or 1–15 (waning)
  isWaxing: boolean
  nextFullMoon: Date
  nextNewMoon: Date
}

export interface HoraHour {
  planet: string
  planetNameThai: string
  startTime: Date
  endTime: Date
  isCurrent: boolean
  meaning: string
  meaningThai: string
  symbol: string
}

export interface ThaiDate {
  buddhistYear: number
  thaiMonth: string
  thaiMonthNumber: number
  thaiDay: number
  wan: number              // day of week 0–6
  wanName: string
  wanNameThai: string
  isAuspicious: boolean
  auspiciousReason: string
}

export interface DailyAstroData {
  planets: PlanetPosition[]
  lunarPhase: LunarPhase
  horaHours: HoraHour[]
  currentHora: HoraHour
  thaiDate: ThaiDate
  sunriseTime: Date
  sunsetTime: Date
  natalTransits: Transit[]  // personal transits if natal chart provided
}

export interface Transit {
  transitingPlanet: string
  natalPlanet: string
  aspect: string           // 'conjunction' | 'trine' | 'square' | 'opposition' | 'sextile'
  aspectDegree: number
  orb: number
  isApplying: boolean
  strength: number         // 1–5
  quality: 'benefic' | 'malefic' | 'neutral'
  keywordsThai: string[]
  keywordsEn: string[]
}

// ─────────────────────────────────────────────
// CORE ASTRONOMICAL ENGINE
// ─────────────────────────────────────────────

export class AstronomicalEngine {

  // ── AYANAMSA (Lahiri) ─────────────────────────────────────────────

  /**
   * Calculates the Lahiri Ayanamsa (precession of equinoxes) for a given date.
   * Traditional Thai astrology uses a sidereal zodiac.
   */
  static getAyanamsa(date: Date): number {
    const jd = Astronomy.MakeTime(date).ut + 2451545.0
    const t = (jd - 2451545.0) / 36525
    // Lahiri ayanamsa approximation
    return (23.85 + (date.getFullYear() - 1950) * 0.0135) % 360
  }

  // ── PLANET POSITIONS ──────────────────────────────────────────────


  static getAllPlanetPositions(date: Date, lat: number, lng: number): PlanetPosition[] {
    const astroDate = Astronomy.MakeTime(date)

    const planets = [
      { key: 'SURYA', body: Astronomy.Body.Sun },
      { key: 'CHANDRA', body: Astronomy.Body.Moon },
      { key: 'MANGAL', body: Astronomy.Body.Mars },
      { key: 'BUDHA', body: Astronomy.Body.Mercury },
      { key: 'GURU', body: Astronomy.Body.Jupiter },
      { key: 'SHUKRA', body: Astronomy.Body.Venus },
      { key: 'SHANI', body: Astronomy.Body.Saturn },
    ]

    const ayanamsa = this.getAyanamsa(date)

    const basePlanets = planets.map(({ key, body }) => {
      let tropicalLon = body === Astronomy.Body.Moon
        ? Astronomy.EclipticGeoMoon(astroDate).lon
        : this.getEclipticLongitude(body, astroDate)

      const longitude = (tropicalLon - ayanamsa + 360) % 360
      const speed = this.getPlanetSpeed(body, date)
      const rasi = Math.floor(longitude / 30)
      const rasiDegree = longitude % 30
      const nakshatraIndex = Math.floor(longitude / (360 / 27))
      const nakshatraPada = Math.floor((longitude % (360 / 27)) / (360 / 27 / 4)) + 1
      const graha = NAVA_GRAHA[key as keyof typeof NAVA_GRAHA]

      return {
        planet: key,
        longitude,
        latitude: 0,
        distance: 1,
        speed,
        rasi,
        rasiDegree,
        nakshatra: nakshatraIndex,
        nakshatraPada,
        isRetrograde: speed < 0,
        nameThai: graha.nameThai,
        nameEn: graha.nameEn,
        symbol: graha.symbol,
      }
    })

    // Add Rahu and Ketu
    const nodes = this.getLunarNodes(date)
    const rahuLon = (nodes.rahu - ayanamsa + 360) % 360
    const ketuLon = (nodes.ketu - ayanamsa + 360) % 360

    const rahu: PlanetPosition = {
      planet: 'RAHU',
      longitude: rahuLon,
      latitude: 0,
      distance: 1,
      speed: -0.05, // Average node speed
      rasi: Math.floor(rahuLon / 30),
      rasiDegree: rahuLon % 30,
      nakshatra: Math.floor(rahuLon / (360 / 27)),
      nakshatraPada: Math.floor((rahuLon % (360 / 27)) / (360 / 27 / 4)) + 1,
      isRetrograde: true,
      nameThai: NAVA_GRAHA.RAHU.nameThai,
      nameEn: NAVA_GRAHA.RAHU.nameEn,
      symbol: NAVA_GRAHA.RAHU.symbol,
    }

    const ketu: PlanetPosition = {
      planet: 'KETU',
      longitude: ketuLon,
      latitude: 0,
      distance: 1,
      speed: -0.05,
      rasi: Math.floor(ketuLon / 30),
      rasiDegree: ketuLon % 30,
      nakshatra: Math.floor(ketuLon / (360 / 27)),
      nakshatraPada: Math.floor((ketuLon % (360 / 27)) / (360 / 27 / 4)) + 1,
      isRetrograde: true,
      nameThai: NAVA_GRAHA.KETU.nameThai,
      nameEn: NAVA_GRAHA.KETU.nameEn,
      symbol: NAVA_GRAHA.KETU.symbol,
    }

    return [...basePlanets, rahu, ketu]

  }

  private static getEclipticLongitude(body: any, time: any): number {
    try {
      const vector = Astronomy.GeoVector(body, time, true)
      const ecliptic = Astronomy.Ecliptic(vector)
      return ((ecliptic.elon % 360) + 360) % 360
    } catch {
      return 0
    }
  }

  private static getPlanetSpeed(body: any, date: Date): number {
    // Calculate speed by comparing positions 1 day apart
    const t1 = Astronomy.MakeTime(date)
    const t2 = Astronomy.MakeTime(new Date(date.getTime() + 86400000))
    const lon1 = this.getEclipticLongitude(body, t1)
    const lon2 = this.getEclipticLongitude(body, t2)
    let diff = lon2 - lon1
    if (diff > 180) diff -= 360
    if (diff < -180) diff += 360
    return diff
  }

  // Compute Rahu and Ketu (lunar nodes — not in astronomy-engine directly)
  static getLunarNodes(date: Date): { rahu: number; ketu: number } {
    // Mean lunar node calculation
    const J = Astronomy.MakeTime(date).ut + 2451545.0
    const T = (J - 2451545.0) / 36525
    const rahu = (((125.0445479 - 1934.1362608 * T
      + 0.0020754 * T * T
      + T * T * T / 467441
      - T * T * T * T / 60616000) % 360) + 360) % 360
    return { rahu, ketu: (rahu + 180) % 360 }
  }

  // ── LUNAR PHASE ───────────────────────────────────────────────────

  static getLunarPhase(date: Date): LunarPhase {
    const phase = Astronomy.MoonPhase(date) / 360 // normalize 0–1

    const thaiNames = [
      { min: 0, max: 0.033, name: 'จันทร์ดับ', nameEn: 'New Moon', waxing: true },
      { min: 0.033, max: 0.25, name: 'ข้างขึ้นเสี้ยว', nameEn: 'Waxing Crescent', waxing: true },
      { min: 0.25, max: 0.27, name: 'ครึ่งดวง', nameEn: 'First Quarter', waxing: true },
      { min: 0.27, max: 0.5, name: 'ข้างขึ้นนูน', nameEn: 'Waxing Gibbous', waxing: true },
      { min: 0.5, max: 0.533, name: 'จันทร์เต็มดวง', nameEn: 'Full Moon', waxing: false },
      { min: 0.533, max: 0.75, name: 'ข้างแรมนูน', nameEn: 'Waning Gibbous', waxing: false },
      { min: 0.75, max: 0.77, name: 'ครึ่งดวงแรม', nameEn: 'Last Quarter', waxing: false },
      { min: 0.77, max: 1.0, name: 'ข้างแรมเสี้ยว', nameEn: 'Waning Crescent', waxing: false },
    ]

    const current = thaiNames.find(n => phase >= n.min && phase < n.max) || thaiNames[0]
    const isWaxing = phase < 0.5
    const thaiLunarDay = isWaxing
      ? Math.round(phase * 30) + 1
      : Math.round((phase - 0.5) * 30) + 1

    const nextFull = Astronomy.SearchMoonPhase(180, date, 40)
    const nextNew = Astronomy.SearchMoonPhase(0, date, 40)

    return {
      phase,
      phaseName: current.nameEn,
      phaseNameThai: current.name,
      illumination: Math.round(Math.abs(Math.cos(phase * 2 * Math.PI)) * 100),
      thaiLunarDay,
      isWaxing,
      nextFullMoon: nextFull ? nextFull.date : new Date(),
      nextNewMoon: nextNew ? nextNew.date : new Date(),
    }
  }

  // ── HORA (PLANETARY HOURS) ─────────────────────────────────────────

  static getHoraHours(date: Date, lat: number, lng: number): HoraHour[] {
    const sunrise = this.getSunrise(date, lat, lng)
    const sunset = this.getSunset(date, lat, lng)
    const nextSunrise = this.getSunrise(new Date(date.getTime() + 86400000), lat, lng)

    const dayDuration = (sunset.getTime() - sunrise.getTime()) / 12
    const nightDuration = (nextSunrise.getTime() - sunset.getTime()) / 12

    // Day ruler index based on weekday
    const dayRulerIndex = {
      0: 0, // Sun rules Sunday
      1: 1, // Moon rules Monday
      2: 2, // Mars rules Tuesday
      3: 3, // Mercury rules Wednesday
      4: 4, // Jupiter rules Thursday
      5: 5, // Venus rules Friday
      6: 6, // Saturn rules Saturday
    }[date.getDay()] || 0

    const hours: HoraHour[] = []
    const now = new Date()

    const horaMeanings: Record<string, { en: string; thai: string }> = {
      SURYA: { en: 'Leadership & vitality', thai: 'ผู้นำและความมีชีวิตชีวา' },
      CHANDRA: { en: 'Intuition & emotion', thai: 'สัญชาตญาณและอารมณ์' },
      MANGAL: { en: 'Courage & action', thai: 'ความกล้าหาญและการลงมือทำ' },
      BUDHA: { en: 'Communication & trade', thai: 'การสื่อสารและการค้า' },
      GURU: { en: 'Luck & expansion', thai: 'โชคลาภและความเจริญ' },
      SHUKRA: { en: 'Love & creativity', thai: 'ความรักและความคิดสร้างสรรค์' },
      SHANI: { en: 'Discipline & karma', thai: 'วินัยและกรรม' },
    }

    // Generate 24 hora hours (12 day + 12 night)
    for (let i = 0; i < 24; i++) {
      const planetKey = HORA_SEQUENCE[(dayRulerIndex + i) % 7]
      const isDay = i < 12
      const duration = isDay ? dayDuration : nightDuration
      const baseTime = isDay ? sunrise : sunset
      const offset = isDay ? i : (i - 12)

      const startTime = new Date(baseTime.getTime() + offset * duration)
      const endTime = new Date(startTime.getTime() + duration)
      const graha = NAVA_GRAHA[planetKey as keyof typeof NAVA_GRAHA]
      const meanings = horaMeanings[planetKey]

      hours.push({
        planet: planetKey,
        planetNameThai: graha.nameThai,
        startTime,
        endTime,
        isCurrent: now >= startTime && now < endTime,
        meaning: meanings.en,
        meaningThai: meanings.thai,
        symbol: graha.symbol,
      })
    }

    return hours
  }

  // ── SUNRISE / SUNSET ──────────────────────────────────────────────

  static getSunrise(date: Date, lat: number, lng: number): Date {
    try {
      const observer = new Astronomy.Observer(lat, lng, 0)
      const result = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, +1, date, 1)
      return result ? result.date : new Date(new Date(date).setHours(6, 0, 0, 0))
    } catch {
      return new Date(new Date(date).setHours(6, 0, 0, 0))
    }
  }

  static getSunset(date: Date, lat: number, lng: number): Date {
    try {
      const observer = new Astronomy.Observer(lat, lng, 0)
      const result = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, -1, date, 1)
      return result ? result.date : new Date(new Date(date).setHours(18, 0, 0, 0))
    } catch {
      return new Date(new Date(date).setHours(18, 0, 0, 0))
    }
  }

  // ── THAI DATE ─────────────────────────────────────────────────────

  static getThaiDate(date: Date): ThaiDate {
    const dt = DateTime.fromJSDate(date).setZone('Asia/Bangkok')
    const buddhistYear = dt.year + BUDDHIST_ERA_OFFSET

    const thaiMonths = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน',
      'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม',
      'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ]

    const thaiDayNames = [
      { en: 'Sunday', thai: 'วันอาทิตย์' },
      { en: 'Monday', thai: 'วันจันทร์' },
      { en: 'Tuesday', thai: 'วันอังคาร' },
      { en: 'Wednesday', thai: 'วันพุธ' },
      { en: 'Thursday', thai: 'วันพฤหัสบดี' },
      { en: 'Friday', thai: 'วันศุกร์' },
      { en: 'Saturday', thai: 'วันเสาร์' },
    ]

    const wan = dt.weekday % 7
    const dayInfo = thaiDayNames[wan]

    // Traditional Thai Auspicious Day Logic (Simplified)
    // Wan Thong Chai (Victory Day) - varies by year, but simplified for now
    const thongChaiDays = [2, 4, 6] // Example: Tue, Thu, Sat
    const inauspiciousDays = [0, 1] // Example: Sun, Mon for some activities

    const isAuspicious = thongChaiDays.includes(wan) && !inauspiciousDays.includes(wan)

    return {
      buddhistYear,
      thaiMonth: thaiMonths[dt.month - 1],
      thaiMonthNumber: dt.month,
      thaiDay: dt.day,
      wan,
      wanName: dayInfo.en,
      wanNameThai: dayInfo.thai,
      isAuspicious,
      auspiciousReason: isAuspicious ? 'วันธงชัย (ฤกษ์ดี)' : 'ควรใช้ความระมัดระวัง',
    }
  }

  // ── NATAL CHART TRANSITS ──────────────────────────────────────────

  static calculateTransits(
    currentPlanets: PlanetPosition[],
    natalChart: NatalChart
  ): Transit[] {
    const birthDate = new Date(natalChart.birthDate)
    const natalPlanets = this.getAllPlanetPositions(
      birthDate, natalChart.birthLat, natalChart.birthLng
    )

    const transits: Transit[] = []
    const aspects = [
      { name: 'conjunction', degrees: 0, orb: 8, quality: 'variable' },
      { name: 'sextile', degrees: 60, orb: 6, quality: 'benefic' },
      { name: 'square', degrees: 90, orb: 8, quality: 'malefic' },
      { name: 'trine', degrees: 120, orb: 8, quality: 'benefic' },
      { name: 'opposition', degrees: 180, orb: 8, quality: 'malefic' },
    ]

    for (const transit of currentPlanets) {
      for (const natal of natalPlanets) {
        const diff = Math.abs(transit.longitude - natal.longitude)
        const normalized = diff > 180 ? 360 - diff : diff

        for (const aspect of aspects) {
          const orb = Math.abs(normalized - aspect.degrees)
          if (orb <= aspect.orb) {
            const strength = Math.round((1 - orb / aspect.orb) * 5)
            const quality = aspect.quality === 'variable'
              ? (NAVA_GRAHA[transit.planet as keyof typeof NAVA_GRAHA] ? 'benefic' : 'neutral')
              : aspect.quality as 'benefic' | 'malefic'

            transits.push({
              transitingPlanet: transit.planet,
              natalPlanet: natal.planet,
              aspect: aspect.name,
              aspectDegree: aspect.degrees,
              orb,
              isApplying: transit.speed > 0,
              strength,
              quality,
              keywordsThai: this.getTransitKeywordsThai(transit.planet, natal.planet, aspect.name),
              keywordsEn: this.getTransitKeywordsEn(transit.planet, natal.planet, aspect.name),
            })
          }
        }
      }
    }

    // Sort by strength descending
    return transits.sort((a, b) => b.strength - a.strength).slice(0, 10)
  }

  private static getTransitKeywordsThai(t: string, n: string, aspect: string): string[] {
    const beneficAspects = ['trine', 'sextile']
    const isBenefic = beneficAspects.includes(aspect)
    const keywords: Record<string, string[]> = {
      SURYA: isBenefic ? ['ความสำเร็จ', 'ชื่อเสียง', 'อำนาจ'] : ['ความตึงเครียด', 'อีโก้', 'ความขัดแย้ง'],
      CHANDRA: isBenefic ? ['สัญชาตญาณ', 'ความสุข', 'ครอบครัว'] : ['อารมณ์แปรปรวน', 'ความไม่มั่นคง'],
      MANGAL: isBenefic ? ['พลังงาน', 'ความกล้า', 'ความกระตือรือร้น'] : ['ความโกรธ', 'อุบัติเหตุ', 'ความรีบร้อน'],
      BUDHA: isBenefic ? ['การสื่อสาร', 'สัญญา', 'การค้า'] : ['ความสับสน', 'การเข้าใจผิด'],
      GURU: isBenefic ? ['โชคลาภ', 'การเติบโต', 'ปัญญา'] : ['การสูญเสีย', 'การขยายที่มากเกินไป'],
      SHUKRA: isBenefic ? ['ความรัก', 'ความงาม', 'ความสุข'] : ['ความสัมพันธ์ที่ยากลำบาก'],
      SHANI: isBenefic ? ['วินัย', 'ความทนทาน', 'ความสำเร็จระยะยาว'] : ['การล่าช้า', 'ข้อจำกัด', 'กรรม'],
    }
    return keywords[t] || ['การเปลี่ยนแปลง']
  }

  private static getTransitKeywordsEn(t: string, n: string, aspect: string): string[] {
    const beneficAspects = ['trine', 'sextile']
    const isBenefic = beneficAspects.includes(aspect)
    const keywords: Record<string, string[]> = {
      SURYA: isBenefic ? ['success', 'recognition', 'authority'] : ['tension', 'ego', 'conflict'],
      CHANDRA: isBenefic ? ['intuition', 'happiness', 'family'] : ['moodiness', 'insecurity'],
      MANGAL: isBenefic ? ['energy', 'courage', 'drive'] : ['anger', 'accidents', 'haste'],
      BUDHA: isBenefic ? ['communication', 'contracts', 'commerce'] : ['confusion', 'misunderstanding'],
      GURU: isBenefic ? ['luck', 'growth', 'wisdom'] : ['loss', 'overexpansion'],
      SHUKRA: isBenefic ? ['love', 'beauty', 'pleasure'] : ['relationship struggles'],
      SHANI: isBenefic ? ['discipline', 'endurance', 'achievement'] : ['delays', 'restrictions', 'karma'],
    }
    return keywords[t] || ['change']
  }

  // ── FULL DAILY COMPUTATION ─────────────────────────────────────────

  static async computeDailyData(
    date: Date,
    lat: number,
    lng: number,
    natalChart?: NatalChart
  ): Promise<DailyAstroData> {
    const planets = this.getAllPlanetPositions(date, lat, lng)
    const lunarPhase = this.getLunarPhase(date)
    const horaHours = this.getHoraHours(date, lat, lng)
    const currentHora = horaHours.find(h => h.isCurrent) || horaHours[0]
    const thaiDate = this.getThaiDate(date)
    const sunriseTime = this.getSunrise(date, lat, lng)
    const sunsetTime = this.getSunset(date, lat, lng)
    const natalTransits = natalChart
      ? this.calculateTransits(planets, natalChart)
      : []

    return {
      planets,
      lunarPhase,
      horaHours,
      currentHora,
      thaiDate,
      sunriseTime,
      sunsetTime,
      natalTransits,
    }
  }
}
