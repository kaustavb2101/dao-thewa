import { ThaiRulesEngine, RuleInputData } from '../../src/engines/ThaiRulesEngine'

describe('ThaiRulesEngine', () => {

  const mockHora = {
    planet: 'GURU',
    planetNameThai: 'ดาวพฤหัส',
    startTime: new Date(),
    endTime: new Date(),
    isCurrent: true,
    meaning: 'Luck & expansion',
    meaningThai: 'โชคลาภและความเจริญ',
    symbol: '♃',
  }

  const mockLunarPhase = {
    phase: 0.5,
    phaseName: 'Full Moon',
    phaseNameThai: 'จันทร์เต็มดวง',
    illumination: 100,
    thaiLunarDay: 15,
    isWaxing: false,
    nextFullMoon: new Date(),
    nextNewMoon: new Date(),
  }

  const mockThaiDate = {
    buddhistYear: 2569,
    thaiMonth: 'กุมภาพันธ์',
    thaiMonthNumber: 2,
    thaiDay: 27,
    wan: 5,
    wanName: 'Friday',
    wanNameThai: 'วันศุกร์',
    isAuspicious: true,
    auspiciousReason: 'ฤกษ์ดี',
  }

  const mockPlanets = [
    {
      planet: 'SURYA', longitude: 45, latitude: 0, distance: 1, speed: 1,
      rasi: 1, rasiDegree: 15, nakshatra: 3, nakshatraPada: 2,
      isRetrograde: false, nameThai: 'ดาวอาทิตย์', nameEn: 'Sun', symbol: '☀️'
    },
    {
      planet: 'BUDHA', longitude: 200, latitude: 0, distance: 1, speed: -0.5,
      rasi: 6, rasiDegree: 20, nakshatra: 14, nakshatraPada: 1,
      isRetrograde: true, nameThai: 'ดาวพุธ', nameEn: 'Mercury', symbol: '☿'
    },
    {
      planet: 'CHANDRA', longitude: 180, latitude: 0, distance: 1, speed: 13,
      rasi: 6, rasiDegree: 0, nakshatra: 12, nakshatraPada: 1,
      isRetrograde: false, nameThai: 'ดาวจันทร์', nameEn: 'Moon', symbol: '🌙'
    },
  ]

  const baseData: RuleInputData = {
    planets: mockPlanets,
    transits: [],
    lunarPhase: mockLunarPhase,
    currentHora: mockHora,
    thaiDate: mockThaiDate,
    wanGerd: 5,
    birthRasi: 1,
    birthNakshatra: 3,
    horaHours: [mockHora],
  }

  test('interpret() returns a valid DailyInterpretation', () => {
    const result = ThaiRulesEngine.interpret(baseData)
    expect(result).toHaveProperty('headline')
    expect(result).toHaveProperty('overallQuality')
    expect(result).toHaveProperty('activeRules')
    expect(result).toHaveProperty('luckyDetails')
    expect(result).toHaveProperty('rawDataForAI')
  })

  test('Mercury retrograde rule fires when Mercury is retrograde', () => {
    const result = ThaiRulesEngine.interpret(baseData)
    const mercuryRule = result.activeRules.find(r => r.id === 'BUDHA_RETROGRADE')
    expect(mercuryRule).toBeDefined()
  })

  test('Full moon rule fires near full moon', () => {
    const result = ThaiRulesEngine.interpret(baseData)
    const fullMoonRule = result.activeRules.find(r => r.id === 'FULL_MOON_POWER')
    expect(fullMoonRule).toBeDefined()
  })

  test('Jupiter hora rule fires when current hora is Jupiter', () => {
    const result = ThaiRulesEngine.interpret(baseData)
    const horaRule = result.activeRules.find(r => r.id === 'HORA_GURU')
    expect(horaRule).toBeDefined()
  })

  test('Wan Gerd match rule fires when birth day matches today', () => {
    const result = ThaiRulesEngine.interpret(baseData) // wanGerd=5, thaiDate.wan=5
    const wanRule = result.activeRules.find(r => r.id === 'WAN_GERD_MATCH_TODAY')
    expect(wanRule).toBeDefined()
  })

  test('overallQuality is one of the valid values', () => {
    const result = ThaiRulesEngine.interpret(baseData)
    const validQualities = ['very auspicious', 'auspicious', 'neutral', 'challenging', 'very challenging']
    expect(validQualities).toContain(result.overallQuality)
  })

  test('luckyDetails has expected structure', () => {
    const result = ThaiRulesEngine.interpret(baseData)
    expect(result.luckyDetails).toHaveProperty('colors')
    expect(result.luckyDetails).toHaveProperty('numbers')
    expect(result.luckyDetails).toHaveProperty('directions')
    expect(result.luckyDetails).toHaveProperty('gemstones')
    expect(Array.isArray(result.luckyDetails.colors)).toBe(true)
    expect(Array.isArray(result.luckyDetails.numbers)).toBe(true)
  })

  test('rawDataForAI has required fields for Claude API', () => {
    const result = ThaiRulesEngine.interpret(baseData)
    const raw = result.rawDataForAI as any
    expect(raw).toHaveProperty('activeRuleCount')
    expect(raw).toHaveProperty('quality')
    expect(raw).toHaveProperty('lunarPhase')
    expect(raw).toHaveProperty('currentHora')
  })

  test('Sun in birth rasi rule fires when sun rasi matches birthRasi', () => {
    const result = ThaiRulesEngine.interpret(baseData) // sun.rasi=1, birthRasi=1
    const sunRule = result.activeRules.find(r => r.id === 'SURYA_IN_BIRTH_RASI')
    expect(sunRule).toBeDefined()
  })
})
