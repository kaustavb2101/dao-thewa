// /tests/AstronomicalEngine.test.ts
import { AstronomicalEngine } from '../../src/engines/AstronomicalEngine'

describe('AstronomicalEngine', () => {

  const testDate = new Date('2026-02-27T09:41:00+07:00')
  const bangkok = { lat: 13.7563, lng: 100.5018 }

  test('getAllPlanetPositions returns 7 planets', () => {
    const planets = AstronomicalEngine.getAllPlanetPositions(testDate, bangkok.lat, bangkok.lng)
    expect(planets).toHaveLength(7)
  })

  test('all planet longitudes are 0–360', () => {
    const planets = AstronomicalEngine.getAllPlanetPositions(testDate, bangkok.lat, bangkok.lng)
    planets.forEach(p => {
      expect(p.longitude).toBeGreaterThanOrEqual(0)
      expect(p.longitude).toBeLessThan(360)
    })
  })

  test('rasi index matches longitude correctly', () => {
    const planets = AstronomicalEngine.getAllPlanetPositions(testDate, bangkok.lat, bangkok.lng)
    planets.forEach(p => {
      expect(p.rasi).toBe(Math.floor(p.longitude / 30))
    })
  })

  test('getLunarPhase returns valid phase 0–1', () => {
    const phase = AstronomicalEngine.getLunarPhase(testDate)
    expect(phase.phase).toBeGreaterThanOrEqual(0)
    expect(phase.phase).toBeLessThan(1)
    expect(phase.phaseNameThai).toBeTruthy()
  })

  test('getHoraHours returns 24 hours', () => {
    const hours = AstronomicalEngine.getHoraHours(testDate, bangkok.lat, bangkok.lng)
    expect(hours).toHaveLength(24)
  })

  test('exactly one hora is current', () => {
    const hours = AstronomicalEngine.getHoraHours(testDate, bangkok.lat, bangkok.lng)
    const current = hours.filter(h => h.isCurrent)
    expect(current).toHaveLength(1)
  })

  test('getThaiDate returns Buddhist year 2569 for 2026', () => {
    const thaiDate = AstronomicalEngine.getThaiDate(testDate)
    expect(thaiDate.buddhistYear).toBe(2569)
  })

  test('full daily computation completes without error', async () => {
    const data = await AstronomicalEngine.computeDailyData(
      testDate, bangkok.lat, bangkok.lng
    )
    expect(data.planets).toHaveLength(7)
    expect(data.lunarPhase).toBeDefined()
    expect(data.currentHora).toBeDefined()
    expect(data.thaiDate.buddhistYear).toBe(2569)
  })
})
