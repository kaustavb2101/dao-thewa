/**
 * ดาวเทวา — OnboardingScreen
 * 5-step birth data collection: Welcome → Date → Time → Location → Ready
 * Computes wanGerd, birthRasi, birthNakshatra from inputs
 * Saves full UserProfile to Zustand + AsyncStorage
 */
import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  Dimensions, ScrollView, Animated, Platform, KeyboardAvoidingView,
  Modal, FlatList
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import { useUserStore } from '../stores/userStore';
import { THAI_RASI, NAKSHATRAS, WAN_GERD_DEITIES, BUDDHIST_ERA_OFFSET } from '../../config/constants';

const { width, height } = Dimensions.get('window');

// ─── STEP DEFINITIONS ────────────────────────────────────────────

const STEPS = ['welcome', 'date', 'time', 'location', 'ready'] as const;
type Step = typeof STEPS[number];

import { COUNTRIES, CountryData, LocationData } from '../config/locations';

const MONTHS_TH = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
const DAYS_TH = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];

// ─── ASTRO COMPUTATION HELPERS ───────────────────────────────────

import { AstronomicalEngine } from '../engines/AstronomicalEngine';

// ─── ASTRO COMPUTATION HELPERS ───────────────────────────────────

function computeBirthRasi(date: Date): number {
  const planets = AstronomicalEngine.getAllPlanetPositions(date, 13.7563, 100.5018); // Default to BKK for rasi
  const sun = planets.find(p => p.planet === 'SURYA');
  return sun ? sun.rasi : 0;
}

function computeBirthNakshatra(birthRasi: number, date: Date): number {
  const planets = AstronomicalEngine.getAllPlanetPositions(date, 13.7563, 100.5018);
  const sun = planets.find(p => p.planet === 'SURYA');
  return sun ? sun.nakshatra : 0;
}


// ─── PROGRESS BAR ────────────────────────────────────────────────

function ProgressBar({ step }: { step: number }) {
  const total = STEPS.length - 1; // welcome doesn't count
  const progress = Math.max(0, step - 1) / (total - 1);
  return (
    <View style={P.wrap}>
      {[1, 2, 3, 4].map(i => (
        <View key={i} style={[P.seg, {
          backgroundColor: i <= step - 1
            ? Colors.gold.bright
            : 'rgba(245,200,66,0.15)',
        }]} />
      ))}
    </View>
  );
}
const P = StyleSheet.create({
  wrap: { flexDirection: 'row', gap: 4, marginHorizontal: 32, marginBottom: 8 },
  seg: { flex: 1, height: 3, borderRadius: 2 },
});

// ─── NUMBER PICKER ───────────────────────────────────────────────

function NumberPicker({
  value, min, max, onChange, label,
}: { value: number; min: number; max: number; onChange: (v: number) => void; label: string }) {
  return (
    <View style={NP.wrap}>
      <Text style={NP.label}>{label}</Text>
      <View style={NP.row}>
        <TouchableOpacity
          style={NP.btn}
          onPress={() => onChange(Math.max(min, value - 1))}
          accessibilityRole="button"
          accessibilityLabel={'ลด ' + label}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        >
          <Text style={NP.arrow}>‹</Text>
        </TouchableOpacity>
        <Text style={NP.val}>{String(value).padStart(2, '0')}</Text>
        <TouchableOpacity
          style={NP.btn}
          onPress={() => onChange(Math.min(max, value + 1))}
          accessibilityRole="button"
          accessibilityLabel={'เพิ่ม ' + label}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        >
          <Text style={NP.arrow}>›</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const NP = StyleSheet.create({
  wrap: { alignItems: 'center', flex: 1 },
  label: { fontSize: 9, color: Colors.text.muted, letterSpacing: 1, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btn: {
    width: 32, height: 32, backgroundColor: Colors.bg.dark, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(245,200,66,0.2)'
  },
  arrow: { fontSize: 20, color: Colors.gold.bright, lineHeight: 24 },
  val: { fontSize: 28, color: Colors.gold.bright, fontWeight: '300', minWidth: 52, textAlign: 'center' },
});

// ─── STEP: WELCOME ───────────────────────────────────────────────

function StepWelcome({ onNext }: { onNext: () => void }) {
  return (
    <View style={S.stepWrap}>
      <View style={S.logoWrap}>
        <Text style={S.logoStar}>✦</Text>
        <Text style={S.logo}>ดาวเทวา</Text>
        <Text style={S.logoEn}>DAO THEWA</Text>
      </View>
      <Text style={S.welcomeTitle}>ยินดีต้อนรับ</Text>
      <Text style={S.welcomeBody}>
        โหราศาสตร์ไทยแบบดั้งเดิม{'\n'}
        ขับเคลื่อนด้วยปัญญาประดิษฐ์{'\n\n'}
        เราต้องการวันเกิดของท่าน{'\n'}
        เพื่อคำนวณดวงชะตาเฉพาะตัว
      </Text>
      <View style={S.featureRow}>
        {[
          { icon: '🌟', text: 'ดวงประจำวัน' },
          { icon: '⌚', text: 'นาฬิกาดาว' },
          { icon: '🔮', text: 'AI โหร' },
        ].map((f, i) => (
          <View key={i} style={S.featurePill}>
            <Text style={S.featureIcon}>{f.icon}</Text>
            <Text style={S.featureText}>{f.text}</Text>
          </View>
        ))}
      </View>
      <TouchableOpacity
        style={S.primaryBtn}
        onPress={onNext}
        accessibilityRole="button"
        accessibilityLabel="เริ่มต้นการใช้งาน"
      >
        <Text style={S.primaryBtnText}>เริ่มต้น →</Text>
      </TouchableOpacity>
      <Text style={S.privacy}>ข้อมูลของท่านเก็บไว้บนอุปกรณ์เท่านั้น</Text>
    </View>
  );
}

// ─── STEP: BIRTH DATE ─────────────────────────────────────────────

function StepDate({ onNext, onBack }: { onNext: (d: Date) => void; onBack: () => void }) {
  const now = new Date();
  const [day, setDay] = useState(1);
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear() - 25);

  const maxDay = new Date(year, month, 0).getDate();
  const safeDay = Math.min(day, maxDay);

  const beYear = year + BUDDHIST_ERA_OFFSET;
  const preview = new Date(year, month - 1, safeDay);
  const dayName = DAYS_TH[preview.getDay()];

  return (
    <View style={S.stepWrap}>
      <Text style={S.stepTitle}>วันเกิดของท่าน</Text>
      <Text style={S.stepSub}>เพื่อคำนวณราศีและวันเกิด</Text>

      <View style={S.dayPreview}>
        <Text style={S.dayPreviewName}>{dayName}</Text>
        <Text style={S.dayPreviewDate}>
          {safeDay} {MONTHS_TH[month - 1]} พ.ศ. {beYear}
        </Text>
        <View style={[S.wanBadge, {
          backgroundColor: `${(Object.values(WAN_GERD_DEITIES)[preview.getDay()] as any)?.color ?? Colors.gold.bright}22`,
          borderColor: `${(Object.values(WAN_GERD_DEITIES)[preview.getDay()] as any)?.color ?? Colors.gold.bright}55`,
        }]}>
          <Text style={[S.wanText, {
            color: (Object.values(WAN_GERD_DEITIES)[preview.getDay()] as any)?.color ?? Colors.gold.bright,
          }]}>
            {(Object.values(WAN_GERD_DEITIES)[preview.getDay()] as any)?.deityNameThai ?? 'เทวา'}
          </Text>
        </View>
      </View>

      <View style={S.pickerRow}>
        <NumberPicker label="วัน" value={safeDay} min={1} max={maxDay} onChange={setDay} />
        <NumberPicker label="เดือน" value={month} min={1} max={12} onChange={setMonth} />
        <NumberPicker label="ปี ค.ศ." value={year} min={1900} max={new Date().getFullYear()} onChange={setYear} />
      </View>

      <View style={S.btnRow}>
        <TouchableOpacity
          style={S.backBtn}
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="ย้อนกลับ"
        >
          <Text style={S.backBtnText}>← กลับ</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={S.primaryBtn}
          onPress={() => onNext(new Date(year, month - 1, safeDay))}
          accessibilityRole="button"
          accessibilityLabel="ดำเนินการต่อ"
        >
          <Text style={S.primaryBtnText}>ถัดไป →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── STEP: BIRTH TIME ─────────────────────────────────────────────

function StepTime({ onNext, onBack }: { onNext: (h: number, m: number) => void; onBack: () => void }) {
  const [hour, setHour] = useState(6);
  const [min, setMin] = useState(0);
  const [unknown, setUnknown] = useState(false);

  return (
    <View style={S.stepWrap}>
      <Text style={S.stepTitle}>เวลาเกิด</Text>
      <Text style={S.stepSub}>ช่วยคำนวณฤกษ์ยามและลัคนา</Text>

      <View style={S.timeDisplay}>
        <Text style={S.bigTime}>
          {String(hour).padStart(2, '0')}:{String(min).padStart(2, '0')}
        </Text>
        <Text style={S.timeZone}>ตามเวลาท้องถิ่นสถานที่เกิด (Local Time)</Text>
      </View>

      {!unknown && (
        <View style={S.pickerRow}>
          <NumberPicker label="ชั่วโมง" value={hour} min={0} max={23} onChange={setHour} />
          <NumberPicker label="นาที" value={min} min={0} max={59} onChange={setMin} />
        </View>
      )}

      <TouchableOpacity
        style={[S.unknownBtn, unknown && S.unknownBtnActive]}
        onPress={() => setUnknown(!unknown)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: unknown }}
        accessibilityLabel="ไม่ทราบเวลาเกิด"
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={[S.unknownText, unknown && S.unknownTextActive]}>
          {unknown ? '✓ ไม่ทราบเวลาเกิด' : 'ไม่ทราบเวลาเกิด'}
        </Text>
      </TouchableOpacity>

      <View style={S.btnRow}>
        <TouchableOpacity
          style={S.backBtn}
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="ย้อนกลับ"
        >
          <Text style={S.backBtnText}>← กลับ</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={S.primaryBtn}
          onPress={() => onNext(unknown ? 6 : hour, unknown ? 0 : min)}
          accessibilityRole="button"
          accessibilityLabel="ดำเนินการต่อ"
        >
          <Text style={S.primaryBtnText}>ถัดไป →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── CUSTOM DROPDOWN SELECTOR (GLASSMORPHIC) ─────────────────────

function DropdownSelector({
  label, value, options, onSelect, placeholder
}: {
  label: string; value: string; options: { id: string; name: string; nameEn?: string }[];
  onSelect: (id: string) => void; placeholder: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={S.dropdownContainer}>
      <Text style={S.dropdownLabel}>{label}</Text>
      <TouchableOpacity
        style={S.dropdownButton}
        onPress={() => setIsOpen(true)}
      >
        <Text style={[S.dropdownButtonText, !value && S.dropdownPlaceholder]}>
          {value || placeholder}
        </Text>
        <Text style={S.dropdownIcon}>▼</Text>
      </TouchableOpacity>

      <Modal visible={isOpen} transparent animationType="fade">
        <TouchableOpacity
          style={S.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={S.modalContent}>
            <Text style={S.modalTitle}>เลือก{label}</Text>
            <FlatList
              data={options}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={S.modalItem}
                  onPress={() => {
                    onSelect(item.id);
                    setIsOpen(false);
                  }}
                >
                  <Text style={S.modalItemText}>{item.name}</Text>
                  {item.nameEn && <Text style={S.modalItemSub}>{item.nameEn}</Text>}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

// ─── STEP: LOCATION ───────────────────────────────────────────────

function StepLocation({
  onNext, onBack,
}: {
  onNext: (lat: number, lng: number, city: string, tz: number) => void;
  onBack: () => void;
}) {
  const [selectedCountryId, setSelectedCountryId] = useState<string>(COUNTRIES[0].id);
  const selectedCountry = COUNTRIES.find((c) => c.id === selectedCountryId) || COUNTRIES[0];

  const [selectedCityName, setSelectedCityName] = useState<string>(selectedCountry.cities[0].name);
  const selectedCity = selectedCountry.cities.find((c) => c.name === selectedCityName) || selectedCountry.cities[0];

  return (
    <View style={S.stepWrap}>
      <Text style={S.stepTitle}>สถานที่เกิด</Text>
      <Text style={S.stepSub}>ใช้สำหรับคำนวณตำแหน่งดวงดาวและสมการเวลาท้องถิ่น</Text>

      <View style={S.locationSelectors}>
        <DropdownSelector
          label="ประเทศ (Country)"
          placeholder="เลือกประเทศ"
          value={selectedCountry.name}
          options={COUNTRIES.map((c) => ({ id: c.id, name: c.name, nameEn: c.nameEn }))}
          onSelect={(id) => {
            setSelectedCountryId(id);
            const newCountry = COUNTRIES.find((c) => c.id === id)!;
            setSelectedCityName(newCountry.cities[0].name);
          }}
        />

        <DropdownSelector
          label="เมือง (City / Province)"
          placeholder="เลือกเมือง"
          value={selectedCity.name}
          options={selectedCountry.cities.map((c) => ({ id: c.name, name: c.name, nameEn: c.nameEn }))}
          onSelect={(name) => setSelectedCityName(name)}
        />
      </View>

      <View style={S.coordBox}>
        <Text style={S.coordText}>
          🌐 พิกัดภูมิศาสตร์: {selectedCity.lat.toFixed(4)}°N, {selectedCity.lng.toFixed(4)}°E
        </Text>
        <Text style={S.coordTextSub}>
          โซนเวลา (Timezone): UTC {selectedCity.tz >= 0 ? '+' : ''}{selectedCity.tz / 60}
        </Text>
      </View>

      <View style={S.btnRow}>
        <TouchableOpacity
          style={S.backBtn}
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="ย้อนกลับ"
        >
          <Text style={S.backBtnText}>← กลับ</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={S.primaryBtn}
          onPress={() => onNext(
            selectedCity.lat,
            selectedCity.lng,
            selectedCity.name,
            selectedCity.tz
          )}
          accessibilityRole="button"
          accessibilityLabel="ดำเนินการต่อ"
        >
          <Text style={S.primaryBtnText}>ถัดไป →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── STEP: READY ─────────────────────────────────────────────────

function StepReady({
  birthDate, birthHour, birthMin, birthCity, birthRasi, wanGerd,
  onFinish,
}: {
  birthDate: Date; birthHour: number; birthMin: number;
  birthCity: string; birthRasi: number; wanGerd: number;
  onFinish: () => void;
}) {
  const beYear = birthDate.getFullYear() + BUDDHIST_ERA_OFFSET;
  const rasi = THAI_RASI[birthRasi];
  const deity = (Object.values(WAN_GERD_DEITIES)[wanGerd] as any);

  return (
    <View style={S.stepWrap}>
      <Text style={S.stepTitle}>ดวงชะตาของท่าน</Text>
      <Text style={S.stepSub}>คำนวณเรียบร้อยแล้ว</Text>

      <View style={S.summaryCard}>
        <View style={S.summaryRow}>
          <Text style={S.summaryIcon}>🗓</Text>
          <View style={S.summaryInfo}>
            <Text style={S.summaryLabel}>วันเกิด</Text>
            <Text style={S.summaryValue}>
              {DAYS_TH[birthDate.getDay()]} {birthDate.getDate()} {MONTHS_TH[birthDate.getMonth()]} พ.ศ. {beYear}
            </Text>
          </View>
        </View>
        <View style={S.summaryRow}>
          <Text style={S.summaryIcon}>⏰</Text>
          <View style={S.summaryInfo}>
            <Text style={S.summaryLabel}>เวลาเกิด</Text>
            <Text style={S.summaryValue}>
              {String(birthHour).padStart(2, '0')}:{String(birthMin).padStart(2, '0')} น. · {birthCity}
            </Text>
          </View>
        </View>
        <View style={S.summaryRow}>
          <Text style={S.summaryIcon}>{rasi?.symbol ?? '♓'}</Text>
          <View style={S.summaryInfo}>
            <Text style={S.summaryLabel}>ราศีเกิด</Text>
            <Text style={[S.summaryValue, { color: Colors.gold.bright }]}>
              {rasi?.nameThai ?? ''} · {rasi?.nameEn ?? ''}
            </Text>
          </View>
        </View>
        <View style={S.summaryRow}>
          <Text style={S.summaryIcon}>🪐</Text>
          <View style={S.summaryInfo}>
            <Text style={S.summaryLabel}>วันเกิด (วันเทวา)</Text>
            <Text style={[S.summaryValue, { color: deity?.color ?? Colors.gold.bright }]}>
              {deity?.deityNameThai ?? ''} · {DAYS_TH[wanGerd]}
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={[S.primaryBtn, S.finishBtn]}
        onPress={onFinish}
        accessibilityRole="button"
        accessibilityLabel="เข้าสู่ดาวเทวา"
      >
        <Text style={S.primaryBtnText}>เข้าสู่ดาวเทวา ✦</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── MAIN SCREEN ──────────────────────────────────────────────────

export default function OnboardingScreen({ onComplete }: { onComplete: () => void }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [birthDate, setBirthDate] = useState<Date>(new Date(1990, 0, 1));
  const [birthHour, setBirthHour] = useState(6);
  const [birthMin, setBirthMin] = useState(0);
  const [birthLat, setBirthLat] = useState(13.7563);
  const [birthLng, setBirthLng] = useState(100.5018);
  const [birthCity, setBirthCity] = useState('กรุงเทพฯ');
  const [birthTzOffset, setBirthTzOffset] = useState(420);

  const { setUser, setOnboardingComplete } = useUserStore();

  const step = STEPS[stepIndex];
  const next = () => setStepIndex(i => Math.min(STEPS.length - 1, i + 1));
  const back = () => setStepIndex(i => Math.max(0, i - 1));

  // Compute Adjusted Time (BKK = UTC+7)
  const bkkDiff = 420 - birthTzOffset;
  const bkkTimeRef = new Date(birthDate);
  bkkTimeRef.setHours(birthHour, birthMin + bkkDiff, 0, 0);
  const bkkDate = new Date(bkkTimeRef.getFullYear(), bkkTimeRef.getMonth(), bkkTimeRef.getDate());
  const bkkHour = bkkTimeRef.getHours();
  const bkkMin = bkkTimeRef.getMinutes();

  const handleFinish = async () => {
    const birthRasi = computeBirthRasi(bkkDate);
    const birthNak = computeBirthNakshatra(birthRasi, bkkDate);
    const wanGerd = bkkDate.getDay();

    await setUser({
      id: `user_${Date.now()}`,
      birthDate: bkkDate,
      birthTime: `${String(bkkHour).padStart(2, '0')}:${String(bkkMin).padStart(2, '0')}`,
      birthLat,
      birthLng,
      birthTimezone: 'Asia/Bangkok',
      birthCity,
      wanGerd,
      birthRasi,
      birthNakshatra: birthNak,
      natalChart: undefined,
      language: 'th',
      notificationHour: 7,
      notificationsEnabled: true,
      isPremium: false,
      createdAt: new Date(),
    });
    setOnboardingComplete();
    onComplete();
  };

  return (
    <LinearGradient
      colors={['#030610', '#060C1E', '#08102A']}
      style={styles.fill}
    >
      <SafeAreaView style={styles.fill}>
        <KeyboardAvoidingView
          style={styles.fill}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Stars background */}
          <View style={styles.starsWrap} pointerEvents="none">
            {[...Array(20)].map((_, i) => (
              <View key={i} style={[styles.star, {
                top: `${Math.random() * 80}%` as any,
                left: `${Math.random() * 100}%` as any,
                opacity: 0.2 + Math.random() * 0.4,
                width: Math.random() > 0.7 ? 2 : 1,
                height: Math.random() > 0.7 ? 2 : 1,
              }]} />
            ))}
          </View>

          {/* Progress (skip on welcome + ready) */}
          {stepIndex > 0 && stepIndex < STEPS.length - 1 && (
            <ProgressBar step={stepIndex} />
          )}

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {step === 'welcome' && <StepWelcome onNext={next} />}
            {step === 'date' && (
              <StepDate onNext={d => { setBirthDate(d); next(); }} onBack={back} />
            )}
            {step === 'time' && (
              <StepTime onNext={(h, m) => { setBirthHour(h); setBirthMin(m); next(); }} onBack={back} />
            )}
            {step === 'location' && (
              <StepLocation
                onNext={(lat, lng, city, tz) => { setBirthLat(lat); setBirthLng(lng); setBirthCity(city); setBirthTzOffset(tz); next(); }}
                onBack={back}
              />
            )}
            {step === 'ready' && (
              <StepReady
                birthDate={bkkDate} birthHour={bkkHour} birthMin={bkkMin}
                birthCity={birthCity + ' (เวลาไทย)'}
                birthRasi={computeBirthRasi(bkkDate)}
                wanGerd={bkkDate.getDay()}
                onFinish={handleFinish}
              />
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────

const styles = StyleSheet.create({
  fill: { flex: 1 },
  starsWrap: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  star: { position: 'absolute', backgroundColor: '#FFFFFF', borderRadius: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center' },
});

const S = StyleSheet.create({
  stepWrap: { paddingHorizontal: 24, paddingVertical: 24 },
  // Welcome
  logoWrap: { alignItems: 'center', marginBottom: 28 },
  logoStar: { fontSize: 32, color: Colors.gold.bright, marginBottom: 8 },
  logo: { fontSize: 36, color: Colors.gold.bright, fontWeight: '300', letterSpacing: 6 },
  logoEn: { fontSize: 10, color: Colors.text.muted, letterSpacing: 8, marginTop: 4 },
  welcomeTitle: { fontSize: 22, color: Colors.text.primary, fontWeight: '600', textAlign: 'center', marginBottom: 12 },
  welcomeBody: { fontSize: 13, color: Colors.text.secondary, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  featureRow: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginBottom: 32 },
  featurePill: {
    alignItems: 'center', backgroundColor: Colors.bg.dark, borderRadius: 12,
    padding: 12, borderWidth: 1, borderColor: 'rgba(245,200,66,0.15)', flex: 1
  },
  featureIcon: { fontSize: 20, marginBottom: 4 },
  featureText: { fontSize: 9, color: Colors.text.muted, textAlign: 'center' },
  privacy: { fontSize: 9, color: Colors.text.muted, textAlign: 'center', marginTop: 12, opacity: 0.5 },
  // Steps
  stepTitle: {
    fontSize: 22, color: Colors.gold.bright, fontWeight: '600', textAlign: 'center',
    marginBottom: 6, letterSpacing: 1
  },
  stepSub: { fontSize: 10, color: Colors.text.muted, textAlign: 'center', marginBottom: 24 },
  // Date
  dayPreview: {
    alignItems: 'center', backgroundColor: Colors.bg.dark, borderRadius: 16,
    padding: 20, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(245,200,66,0.1)'
  },
  dayPreviewName: { fontSize: 14, color: Colors.text.muted, marginBottom: 4 },
  dayPreviewDate: { fontSize: 16, color: Colors.text.primary, fontWeight: '500' },
  wanBadge: {
    marginTop: 10, paddingHorizontal: 14, paddingVertical: 5,
    borderRadius: 10, borderWidth: 1
  },
  wanText: { fontSize: 11, fontWeight: '600' },
  // Time
  timeDisplay: { alignItems: 'center', marginBottom: 24 },
  bigTime: { fontSize: 52, color: Colors.gold.bright, fontWeight: '200', letterSpacing: 4 },
  timeZone: { fontSize: 9, color: Colors.text.muted, marginTop: 4 },
  unknownBtn: {
    alignSelf: 'center', padding: 10, paddingHorizontal: 20, borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(245,200,66,0.2)', marginTop: 16
  },
  unknownBtnActive: { borderColor: Colors.gold.bright, backgroundColor: 'rgba(245,200,66,0.08)' },
  unknownText: { fontSize: 11, color: Colors.text.muted },
  unknownTextActive: { color: Colors.gold.bright },
  // Location & Dropdowns
  locationSelectors: { marginBottom: 24, gap: 16 },
  dropdownContainer: {},
  dropdownLabel: { fontSize: 11, color: Colors.text.muted, marginBottom: 8, letterSpacing: 0.5 },
  dropdownButton: {
    backgroundColor: Colors.bg.dark, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 16,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(245,200,66,0.15)'
  },
  dropdownButtonText: { fontSize: 14, color: Colors.text.primary, fontWeight: '500' },
  dropdownPlaceholder: { color: Colors.text.muted, fontWeight: '400' },
  dropdownIcon: { fontSize: 10, color: Colors.gold.bright },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(3,6,16,0.85)', justifyContent: 'center', padding: 24 },
  modalContent: {
    backgroundColor: '#0A122A', borderRadius: 20, padding: 20, maxHeight: height * 0.6,
    borderWidth: 1, borderColor: 'rgba(245,200,66,0.2)', elevation: 10, shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 20
  },
  modalTitle: { fontSize: 18, color: Colors.gold.bright, fontWeight: '600', marginBottom: 16, textAlign: 'center' },
  modalItem: {
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
  },
  modalItemText: { fontSize: 14, color: Colors.text.primary },
  modalItemSub: { fontSize: 11, color: Colors.text.muted },

  coordBox: {
    backgroundColor: 'rgba(79,195,247,0.05)', borderRadius: 12, padding: 14,
    alignItems: 'center', borderWidth: 1, borderColor: 'rgba(79,195,247,0.15)',
    marginBottom: 24
  },
  coordText: { fontSize: 11, color: Colors.celestial.sky, marginBottom: 4 },
  coordTextSub: { fontSize: 10, color: 'rgba(79,195,247,0.6)' },
  // Summary
  summaryCard: {
    backgroundColor: Colors.bg.dark, borderRadius: 16, padding: 16,
    marginBottom: 24, borderWidth: 1, borderColor: 'rgba(245,200,66,0.12)'
  },
  summaryRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)'
  },
  summaryIcon: { fontSize: 20, width: 28, textAlign: 'center' },
  summaryInfo: { flex: 1 },
  summaryLabel: { fontSize: 8, color: Colors.text.muted, letterSpacing: 0.5, marginBottom: 3 },
  summaryValue: { fontSize: 13, color: Colors.text.primary, fontWeight: '500' },
  // Buttons
  pickerRow: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  btnRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  primaryBtn: {
    flex: 1, backgroundColor: 'rgba(245,200,66,0.12)', borderRadius: 16,
    paddingVertical: 16, alignItems: 'center', borderWidth: 1,
    borderColor: 'rgba(245,200,66,0.4)'
  },
  primaryBtnText: { fontSize: 14, color: Colors.gold.bright, fontWeight: '600', letterSpacing: 1 },
  backBtn: {
    paddingVertical: 16, paddingHorizontal: 20, borderRadius: 16,
    backgroundColor: Colors.bg.dark, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)', alignItems: 'center'
  },
  backBtnText: { fontSize: 13, color: Colors.text.muted },
  finishBtn: { marginTop: 4, flex: 0, alignSelf: 'stretch' },
});
