/**
 * ดาวเทวา — FaceReadingScreen (โหงวเฮ้ง)
 * Thai-Chinese Five Elements face reading · AutoX pipeline
 *
 * Flow:
 *  Step 0 — Intro
 *  Step 1 — Select face shape (dominant element)
 *  Step 2 — Assess each of the 5 face zones
 *  Step 3 — AutoX analysis runs → results displayed
 */

import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Dimensions, ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  FACE_SHAPES,
  FACE_ZONES,
  FaceZoneId,
  WuXingElement,
  ELEMENT_META,
  FaceReadingResult,
} from '../engines/FaceReadingEngine';
import { AutoXFaceAnalyzer } from '../services/AutoXFaceAnalyzer';
import { FaceZoneSelector } from '../components/FaceZoneSelector';
import { GoldDivider } from '../components/GoldDivider';
import { Colors } from '../theme/colors';
import { useDailyData } from '../hooks/useDailyData';

const { width } = Dimensions.get('window');
const TOTAL_STEPS = 3;

// ─── STEP 0: Intro ────────────────────────────────────────────────

function IntroStep({ onStart }: { onStart: () => void }) {
  return (
    <View style={S.centered}>
      <Text style={S.heroSymbol}>🔮</Text>
      <Text style={S.heroTitle}>โหงวเฮ้ง</Text>
      <Text style={S.heroSubtitle}>五行相法 · Five Elements Face Reading</Text>
      <Text style={S.heroDesc}>
        โหงวเฮ้งเป็นศาสตร์โบราณของไทย-จีนที่อ่านดวงชะตาจากลักษณะใบหน้า
        โดยอิงหลักธาตุทั้ง 5 ได้แก่ ไม้ · ไฟ · ดิน · ทอง · น้ำ
      </Text>
      <View style={S.elementRow}>
        {FACE_SHAPES.map(s => (
          <View key={s.id} style={S.elementPill}>
            <Text style={S.elementPillSymbol}>{s.symbol}</Text>
            <Text style={[S.elementPillName, { color: s.colorHex }]}>{s.nameThai.split(' ')[0]}</Text>
          </View>
        ))}
      </View>
      <TouchableOpacity style={S.startBtn} onPress={onStart} accessibilityRole="button">
        <Text style={S.startBtnText}>เริ่มการวิเคราะห์</Text>
      </TouchableOpacity>
      <Text style={S.hint}>AutoX · ขั้นตอนอัตโนมัติ 5 ระดับ</Text>
    </View>
  );
}

// ─── STEP 1: Shape Selector ───────────────────────────────────────

function ShapeStep({
  selectedShape,
  onSelect,
  onNext,
}: {
  selectedShape: WuXingElement | null;
  onSelect: (el: WuXingElement) => void;
  onNext: () => void;
}) {
  return (
    <View style={S.stepWrap}>
      <Text style={S.stepTitle}>ขั้นตอนที่ 1 / 2</Text>
      <Text style={S.stepHeading}>รูปทรงใบหน้าของท่านคือแบบใด?</Text>
      <Text style={S.stepHint}>รูปทรงใบหน้าเผยถึงธาตุหลักในชะตาชีวิต</Text>

      <View style={S.shapeGrid}>
        {FACE_SHAPES.map(shape => (
          <TouchableOpacity
            key={shape.id}
            style={[
              S.shapeCard,
              selectedShape === shape.id && {
                borderColor: shape.colorHex,
                backgroundColor: `${shape.colorHex}14`,
              },
            ]}
            onPress={() => onSelect(shape.id)}
            accessibilityRole="radio"
            accessibilityState={{ checked: selectedShape === shape.id }}
          >
            <Text style={S.shapeSymbol}>{shape.symbol}</Text>
            <Text style={[S.shapeName, { color: shape.colorHex }]}>{shape.nameThai}</Text>
            <Text style={S.shapeDesc}>{shape.descriptionThai}</Text>
            <View style={S.traitWrap}>
              {shape.traitsThai.slice(0, 3).map(t => (
                <Text key={t} style={S.trait}>· {t}</Text>
              ))}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[S.nextBtn, !selectedShape && S.nextBtnDisabled]}
        onPress={onNext}
        disabled={!selectedShape}
      >
        <Text style={S.nextBtnText}>ถัดไป →</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── STEP 2: Zone Selectors ───────────────────────────────────────

function ZonesStep({
  zoneSelections,
  onSelectFeature,
  onAnalyze,
}: {
  zoneSelections: Partial<Record<FaceZoneId, string>>;
  onSelectFeature: (zoneId: FaceZoneId, featureId: string) => void;
  onAnalyze: () => void;
}) {
  const completedCount = Object.keys(zoneSelections).length;

  return (
    <View style={S.stepWrap}>
      <Text style={S.stepTitle}>ขั้นตอนที่ 2 / 2</Text>
      <Text style={S.stepHeading}>ประเมิน 5 โซนใบหน้า</Text>
      <Text style={S.stepHint}>
        เลือกลักษณะที่ตรงกับใบหน้าของท่านมากที่สุด ({completedCount}/5)
      </Text>

      {FACE_ZONES.map(zone => (
        <FaceZoneSelector
          key={zone.id}
          zone={zone}
          selectedFeatureId={zoneSelections[zone.id] ?? null}
          onSelect={(featureId) => onSelectFeature(zone.id, featureId)}
        />
      ))}

      <TouchableOpacity
        style={[S.nextBtn, completedCount < 3 && S.nextBtnDisabled]}
        onPress={onAnalyze}
        disabled={completedCount < 3}
      >
        <Text style={S.nextBtnText}>
          {completedCount < 3
            ? `เลือกอีก ${3 - completedCount} โซน`
            : '🔮 วิเคราะห์โหงวเฮ้ง (AutoX)'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── STEP 3: Results ──────────────────────────────────────────────

function ResultStep({
  result,
  onReset,
}: {
  result: FaceReadingResult;
  onReset: () => void;
}) {
  const meta = ELEMENT_META[result.dominantElement];
  const scoreColor =
    result.overallScore >= 70 ? Colors.success :
    result.overallScore >= 50 ? Colors.warning  : Colors.danger;

  return (
    <View style={S.stepWrap}>
      {/* Headline */}
      <View style={[S.resultHeader, { borderColor: result.faceShape.colorHex }]}>
        <Text style={S.resultHeroSymbol}>{result.faceShape.symbol}</Text>
        <Text style={[S.resultHeadline, { color: result.faceShape.colorHex }]}>
          {result.headline}
        </Text>
        <View style={S.scoreRow}>
          <Text style={[S.scoreValue, { color: scoreColor }]}>{result.overallScore}</Text>
          <Text style={S.scoreMax}>/100</Text>
          <Text style={[S.scoreLabel, { color: scoreColor }]}>{result.overallQualityThai}</Text>
        </View>
      </View>

      {/* Summary */}
      <View style={S.card}>
        <Text style={S.cardTitle}>สรุปดวงชะตา</Text>
        <Text style={S.summaryText}>{result.summaryThai}</Text>
      </View>

      <GoldDivider symbol="五" />

      {/* Zone breakdown */}
      <View style={S.card}>
        <Text style={S.cardTitle}>ผลประเมิน 5 โซน</Text>
        {result.zoneScores.map(zs => {
          const zone = FACE_ZONES.find(z => z.id === zs.zoneId)!;
          const feature = zone.features.find(f => f.id === zs.featureId)!;
          const qColor = zs.quality === 'auspicious' ? Colors.success
            : zs.quality === 'neutral' ? Colors.warning : Colors.danger;
          return (
            <View key={zs.zoneId} style={S.zoneRow}>
              <Text style={S.zoneRowSymbol}>{zone.symbol}</Text>
              <View style={S.zoneRowBody}>
                <Text style={S.zoneRowName}>{zone.nameThai}</Text>
                <Text style={S.zoneRowFeature}>{feature?.labelThai}</Text>
              </View>
              <View style={[S.scoreChip, { backgroundColor: `${qColor}22` }]}>
                <Text style={[S.scoreChipText, { color: qColor }]}>{zs.score * 10}%</Text>
              </View>
            </View>
          );
        })}
      </View>

      <GoldDivider />

      {/* Strengths & challenges */}
      <View style={S.twoCol}>
        <View style={[S.halfCard, { borderColor: `${Colors.success}44` }]}>
          <Text style={[S.halfTitle, { color: Colors.success }]}>จุดแข็ง</Text>
          {result.strengthsThai.map(s => (
            <Text key={s} style={S.halfItem}>✦ {s}</Text>
          ))}
        </View>
        <View style={[S.halfCard, { borderColor: `${Colors.warning}44` }]}>
          <Text style={[S.halfTitle, { color: Colors.warning }]}>ใส่ใจ</Text>
          {result.challengesThai.map(c => (
            <Text key={c} style={S.halfItem}>⚠ {c}</Text>
          ))}
        </View>
      </View>

      {/* Lucky details */}
      <View style={S.card}>
        <Text style={S.cardTitle}>มงคล</Text>
        <View style={S.luckyRow}>
          <LuckyChip label="สีมงคล" value="●" valueStyle={{ color: meta.luckyColorHex, fontSize: 20 }} />
          <LuckyChip label="เลขมงคล" value={String(meta.luckyNumber)} />
          <LuckyChip label="ทิศมงคล" value={meta.luckyDirectionThai} />
        </View>
      </View>

      {/* Compatible elements */}
      <View style={S.card}>
        <Text style={S.cardTitle}>ธาตุเกื้อกูล</Text>
        <View style={S.elementCompatRow}>
          {result.compatibleElements.map(el => {
            const shape = FACE_SHAPES.find(s => s.id === el)!;
            return (
              <View key={el} style={[S.compatChip, { borderColor: shape.colorHex }]}>
                <Text style={S.compatSymbol}>{shape.symbol}</Text>
                <Text style={[S.compatName, { color: shape.colorHex }]}>{shape.nameThai.split(' ')[0]}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <GoldDivider symbol="★" />

      {/* Planetary resonance */}
      <View style={S.card}>
        <Text style={S.cardTitle}>ดาวประจำธาตุ</Text>
        <Text style={S.planetText}>{result.planetaryResonanceThai}</Text>
      </View>

      {/* AutoX log */}
      <View style={[S.card, { borderColor: 'rgba(79,195,247,0.2)' }]}>
        <Text style={[S.cardTitle, { color: Colors.celestial.sky }]}>
          AutoX Pipeline · {result.autoXConfidence}% confidence
        </Text>
        {result.autoXStages.map(stage => (
          <View key={stage.stage} style={S.logRow}>
            <View style={[S.logDot, { opacity: stage.confidence / 100 }]} />
            <View style={S.logBody}>
              <Text style={S.logStage}>{stage.stage}</Text>
              <Text style={S.logResult}>{stage.resultThai}</Text>
            </View>
            <Text style={S.logConf}>{stage.confidence}%</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={S.resetBtn} onPress={onReset}>
        <Text style={S.resetBtnText}>🔄 วิเคราะห์ใหม่</Text>
      </TouchableOpacity>
      <View style={{ height: 40 }} />
    </View>
  );
}

// ─── Lucky Chip ───────────────────────────────────────────────────

function LuckyChip({ label, value, valueStyle }: {
  label: string; value: string; valueStyle?: object;
}) {
  return (
    <View style={S.luckyChip}>
      <Text style={[S.luckyValue, valueStyle]}>{value}</Text>
      <Text style={S.luckyLabel}>{label}</Text>
    </View>
  );
}

// ─── MAIN SCREEN ──────────────────────────────────────────────────

export default function FaceReadingScreen() {
  const { data } = useDailyData();

  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  const [selectedShape, setSelectedShape] = useState<WuXingElement | null>(null);
  const [zoneSelections, setZoneSelections] = useState<Partial<Record<FaceZoneId, string>>>({});
  const [result, setResult] = useState<FaceReadingResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSelectFeature = useCallback((zoneId: FaceZoneId, featureId: string) => {
    setZoneSelections(prev => ({ ...prev, [zoneId]: featureId }));
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!selectedShape) return;
    setLoading(true);

    // Small async tick so UI renders spinner
    await new Promise(r => setTimeout(r, 320));

    const horaName = data?.currentHora?.planetNameThai;
    const state = AutoXFaceAnalyzer.analyze({
      shapeElement: selectedShape,
      zoneSelections,
      horaName,
    });

    setResult(state.result);
    setStep(3);
    setLoading(false);
  }, [selectedShape, zoneSelections, data]);

  const handleReset = useCallback(() => {
    setStep(0);
    setSelectedShape(null);
    setZoneSelections({});
    setResult(null);
  }, []);

  const progressPct = ((step) / TOTAL_STEPS) * 100;

  return (
    <LinearGradient colors={['#0A0A14', '#0F0F1E', '#0A0A14']} style={S.fill}>
      <SafeAreaView style={S.fill}>
        {/* Header */}
        <View style={S.header}>
          <Text style={S.headerTitle}>โหงวเฮ้ง</Text>
          <Text style={S.headerSub}>Five Elements Face Reading · AutoX</Text>
        </View>

        {/* Progress bar */}
        {step > 0 && step < 3 && (
          <View style={S.progressBar}>
            <View style={[S.progressFill, { width: `${progressPct}%` }]} />
          </View>
        )}

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={S.scroll}>
          {loading && (
            <View style={S.centered}>
              <ActivityIndicator size="large" color={Colors.gold.bright} />
              <Text style={S.loadingText}>AutoX กำลังวิเคราะห์...</Text>
            </View>
          )}

          {!loading && step === 0 && <IntroStep onStart={() => setStep(1)} />}

          {!loading && step === 1 && (
            <ShapeStep
              selectedShape={selectedShape}
              onSelect={setSelectedShape}
              onNext={() => setStep(2)}
            />
          )}

          {!loading && step === 2 && (
            <ZonesStep
              zoneSelections={zoneSelections}
              onSelectFeature={handleSelectFeature}
              onAnalyze={handleAnalyze}
            />
          )}

          {!loading && step === 3 && result && (
            <ResultStep result={result} onReset={handleReset} />
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────

const S = StyleSheet.create({
  fill: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingBottom: 24 },
  header: { alignItems: 'center', paddingTop: 20, paddingBottom: 8, paddingHorizontal: 16 },
  headerTitle: { fontSize: 20, color: Colors.gold.bright, fontWeight: '700', letterSpacing: 2 },
  headerSub: { fontSize: 10, color: Colors.text.muted, marginTop: 4 },
  progressBar: {
    height: 2, backgroundColor: Colors.bg.subtle, marginHorizontal: 16, borderRadius: 1,
  },
  progressFill: { height: 2, backgroundColor: Colors.gold.bright, borderRadius: 1 },

  // Intro
  centered: { alignItems: 'center', paddingVertical: 32 },
  heroSymbol: { fontSize: 56, marginBottom: 12 },
  heroTitle: { fontSize: 28, color: Colors.gold.bright, fontWeight: '700', letterSpacing: 3 },
  heroSubtitle: { fontSize: 12, color: Colors.text.muted, marginTop: 4, marginBottom: 16 },
  heroDesc: {
    fontSize: 13, color: Colors.text.secondary, textAlign: 'center',
    lineHeight: 20, paddingHorizontal: 8, marginBottom: 20,
  },
  elementRow: { flexDirection: 'row', gap: 8, marginBottom: 28 },
  elementPill: { alignItems: 'center', gap: 4 },
  elementPillSymbol: { fontSize: 22 },
  elementPillName: { fontSize: 10, fontWeight: '600' },
  startBtn: {
    backgroundColor: 'rgba(245,200,66,0.12)', borderRadius: 24,
    paddingHorizontal: 36, paddingVertical: 14,
    borderWidth: 1, borderColor: 'rgba(245,200,66,0.4)',
  },
  startBtnText: { fontSize: 16, color: Colors.gold.bright, fontWeight: '600', letterSpacing: 1 },
  hint: { fontSize: 10, color: Colors.text.muted, marginTop: 12 },

  // Steps
  stepWrap: { paddingTop: 12 },
  stepTitle: { fontSize: 10, color: Colors.text.muted, letterSpacing: 1, marginBottom: 6 },
  stepHeading: { fontSize: 18, color: Colors.text.primary, fontWeight: '600', marginBottom: 4 },
  stepHint: { fontSize: 12, color: Colors.text.muted, marginBottom: 16 },

  // Shape grid
  shapeGrid: { gap: 12, marginBottom: 20 },
  shapeCard: {
    backgroundColor: Colors.bg.dark, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
  },
  shapeSymbol: { fontSize: 24, marginBottom: 6 },
  shapeName: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  shapeDesc: { fontSize: 12, color: Colors.text.muted, lineHeight: 18, marginBottom: 8 },
  traitWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  trait: { fontSize: 11, color: Colors.text.muted },

  // Buttons
  nextBtn: {
    backgroundColor: 'rgba(245,200,66,0.12)', borderRadius: 24,
    paddingVertical: 14, alignItems: 'center', marginTop: 8,
    borderWidth: 1, borderColor: 'rgba(245,200,66,0.4)',
  },
  nextBtnDisabled: { opacity: 0.4 },
  nextBtnText: { fontSize: 14, color: Colors.gold.bright, fontWeight: '600' },

  // Results
  resultHeader: {
    alignItems: 'center', padding: 20, borderRadius: 16,
    backgroundColor: Colors.bg.dark, borderWidth: 1, marginBottom: 14,
  },
  resultHeroSymbol: { fontSize: 44, marginBottom: 8 },
  resultHeadline: { fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 10 },
  scoreRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  scoreValue: { fontSize: 36, fontWeight: '800' },
  scoreMax: { fontSize: 14, color: Colors.text.muted },
  scoreLabel: { fontSize: 14, fontWeight: '600', marginLeft: 6 },
  summaryText: { fontSize: 13, color: Colors.text.secondary, lineHeight: 22 },

  // Cards
  card: {
    backgroundColor: Colors.bg.dark, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', marginBottom: 10,
  },
  cardTitle: {
    fontSize: 10, color: Colors.text.muted, letterSpacing: 1.5,
    textTransform: 'uppercase', marginBottom: 10,
  },

  // Zone rows
  zoneRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  zoneRowSymbol: { fontSize: 18, width: 26 },
  zoneRowBody: { flex: 1 },
  zoneRowName: { fontSize: 13, color: Colors.text.secondary, fontWeight: '600' },
  zoneRowFeature: { fontSize: 11, color: Colors.text.muted, marginTop: 2 },
  scoreChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  scoreChipText: { fontSize: 11, fontWeight: '700' },

  // Two column
  twoCol: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  halfCard: {
    flex: 1, backgroundColor: Colors.bg.dark, borderRadius: 12, padding: 12,
    borderWidth: 1,
  },
  halfTitle: { fontSize: 11, fontWeight: '700', marginBottom: 8, letterSpacing: 1 },
  halfItem: { fontSize: 12, color: Colors.text.secondary, marginBottom: 4, lineHeight: 18 },

  // Lucky
  luckyRow: { flexDirection: 'row', justifyContent: 'space-around' },
  luckyChip: { alignItems: 'center', gap: 4 },
  luckyValue: { fontSize: 18, color: Colors.gold.bright, fontWeight: '700' },
  luckyLabel: { fontSize: 10, color: Colors.text.muted },

  // Compat
  elementCompatRow: { flexDirection: 'row', gap: 10 },
  compatChip: {
    flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1,
  },
  compatSymbol: { fontSize: 20, marginBottom: 4 },
  compatName: { fontSize: 11, fontWeight: '600' },

  // Planetary
  planetText: { fontSize: 13, color: Colors.text.secondary, lineHeight: 20 },

  // AutoX log
  logRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  logDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.celestial.sky, marginTop: 5 },
  logBody: { flex: 1 },
  logStage: { fontSize: 10, color: Colors.celestial.sky, fontFamily: 'monospace' },
  logResult: { fontSize: 12, color: Colors.text.secondary, marginTop: 2 },
  logConf: { fontSize: 10, color: Colors.text.muted, width: 32, textAlign: 'right' },

  // Reset
  resetBtn: {
    alignItems: 'center', paddingVertical: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 24, marginTop: 4,
  },
  resetBtnText: { fontSize: 14, color: Colors.text.muted },
  loadingText: { color: Colors.text.muted, marginTop: 12, fontSize: 13 },
});
