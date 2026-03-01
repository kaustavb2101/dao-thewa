/**
 * ดาวเทวา — AlmanacScreen (คัมภีร์โหราศาสตร์)
 * Palm-leaf manuscript cards · Thai astrological knowledge base
 * Yantra SVG · Nakshatra table · Historical Thai periods
 */
import React, {useState} from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {SafeAreaView} from 'react-native-safe-area-context';
import Svg, {
  Circle, Line, Polygon, Text as SvgText, G, Rect,
} from 'react-native-svg';
import {GoldDivider} from '../components/GoldDivider';
import {Colors} from '../theme/colors';
import {NAVA_GRAHA, THAI_RASI, NAKSHATRAS, WAN_GERD_DEITIES} from '../../config/constants';

const {width} = Dimensions.get('window');

// ─── YANTRA SVG ───────────────────────────────────────────────────

/**
 * Nava Graha Yantra — 3×3 magic square with planetary symbols
 * Traditional arrangement: Saturn center, planets at 8 directions
 */
function NavaGrahaYantra({size = 200}: {size?: number}) {
  const cell = size / 3;
  const cx = size / 2;
  const cy = size / 2;

  // Nava Graha Yantra layout (traditional Thai placement)
  const YANTRA_GRID = [
    ['MANGAL',  'RAHU',    'GURU'],
    ['SHANI',   'SURYA',   'CHANDRA'],
    ['BUDHA',   'KETU',    'SHUKRA'],
  ];

  const YANTRA_BG = [
    ['#1A0A30','#0D1530','#102808'],
    ['#200808','#0A0B1E','#1A1008'],
    ['#081830','#180820','#0A1820'],
  ];

  return (
    <Svg width={size} height={size}>
      {/* Outer frame */}
      <Rect x={2} y={2} width={size - 4} height={size - 4}
        fill="none" stroke={Colors.gold.warm} strokeWidth={1.5} />
      <Rect x={6} y={6} width={size - 12} height={size - 12}
        fill="none" stroke="rgba(212,160,23,0.3)" strokeWidth={0.5} />

      {YANTRA_GRID.map((row, r) =>
        row.map((key, c) => {
          const graha = NAVA_GRAHA[key as keyof typeof NAVA_GRAHA];
          const x = c * cell;
          const y = r * cell;
          const isCenter = r === 1 && c === 1;
          return (
            <G key={`${r}${c}`}>
              <Rect x={x + 1} y={y + 1} width={cell - 2} height={cell - 2}
                fill={YANTRA_BG[r][c]}
                stroke="rgba(212,160,23,0.2)" strokeWidth={0.5} />
              {/* Symbol */}
              <SvgText
                x={x + cell / 2} y={y + cell / 2 - 6}
                textAnchor="middle" dominantBaseline="middle"
                fontSize={isCenter ? 20 : 16}
                fill={isCenter ? Colors.gold.bright : graha?.color ?? '#C8A854'}
              >
                {graha?.symbol ?? '☽'}
              </SvgText>
              {/* Thai name */}
              <SvgText
                x={x + cell / 2} y={y + cell / 2 + 12}
                textAnchor="middle" dominantBaseline="middle"
                fontSize={7}
                fill={isCenter ? Colors.gold.warm : 'rgba(200,168,84,0.6)'}
              >
                {graha?.nameThai ?? key}
              </SvgText>
            </G>
          );
        })
      )}

      {/* Grid lines */}
      <Line x1={cell} y1={0} x2={cell} y2={size} stroke="rgba(212,160,23,0.3)" strokeWidth={1} />
      <Line x1={cell * 2} y1={0} x2={cell * 2} y2={size} stroke="rgba(212,160,23,0.3)" strokeWidth={1} />
      <Line x1={0} y1={cell} x2={size} y2={cell} stroke="rgba(212,160,23,0.3)" strokeWidth={1} />
      <Line x1={0} y1={cell * 2} x2={size} y2={cell * 2} stroke="rgba(212,160,23,0.3)" strokeWidth={1} />
    </Svg>
  );
}

// ─── TAB SYSTEM ───────────────────────────────────────────────────

const TABS = [
  {key: 'graha',    label: 'นวเคราะห์'},
  {key: 'rasi',     label: 'จักรราศี'},
  {key: 'nakshatra',label: 'นักษัตร'},
  {key: 'wan',      label: 'วันเกิด'},
  {key: 'yantra',   label: 'ยันต์'},
];

// ─── SECTION COMPONENTS ───────────────────────────────────────────

function GrahaSection() {
  const keys = Object.keys(NAVA_GRAHA) as (keyof typeof NAVA_GRAHA)[];
  return (
    <View style={Sec.wrap}>
      {keys.map(k => {
        const g = NAVA_GRAHA[k];
        return (
          <View key={k} style={Sec.card}>
            <View style={[Sec.symbolBox, {backgroundColor: `${g.color}22`, borderColor: `${g.color}44`}]}>
              <Text style={[Sec.symbol, {color: g.color}]}>{g.symbol}</Text>
            </View>
            <View style={Sec.info}>
              <Text style={Sec.nameThai}>{g.nameThai}</Text>
              <Text style={Sec.nameEn}>{g.nameEn ?? k}</Text>
              <Text style={Sec.desc} numberOfLines={2}>{g.meaningThai ?? g.meaning ?? ''}</Text>
            </View>
            <View style={[Sec.colorBar, {backgroundColor: g.color}]} />
          </View>
        );
      })}
    </View>
  );
}

function RasiSection() {
  return (
    <View style={Sec.grid}>
      {THAI_RASI.map((rasi, i) => (
        <View key={i} style={Sec.rasiCard}>
          <Text style={Sec.rasiSym}>{rasi.symbol}</Text>
          <Text style={Sec.rasiThai}>{rasi.nameThai}</Text>
          <Text style={Sec.rasiEn}>{rasi.nameEn ?? ''}</Text>
          <Text style={Sec.rasiEl}>{rasi.element ?? ''}</Text>
        </View>
      ))}
    </View>
  );
}

function NakshatraSection() {
  return (
    <View style={Sec.nakWrap}>
      <View style={Sec.nakHeader}>
        <Text style={[Sec.nakCol, {flex: 0.5}]}>#</Text>
        <Text style={[Sec.nakCol, {flex: 2}]}>นักษัตร</Text>
        <Text style={[Sec.nakCol, {flex: 1.5}]}>เจ้าเรือน</Text>
        <Text style={[Sec.nakCol, {flex: 1.5}]}>สัตว์</Text>
      </View>
      {NAKSHATRAS.map((n, i) => (
        <View key={i} style={[Sec.nakRow, i % 2 === 0 && Sec.nakRowAlt]}>
          <Text style={[Sec.nakCell, {flex: 0.5}]}>{i + 1}</Text>
          <Text style={[Sec.nakCell, {flex: 2, color: Colors.gold.warm}]}>{n.nameThai ?? n.name}</Text>
          <Text style={[Sec.nakCell, {flex: 1.5}]}>{n.ruler ?? '—'}</Text>
          <Text style={[Sec.nakCell, {flex: 1.5}]}>{n.symbol ?? '—'}</Text>
        </View>
      ))}
    </View>
  );
}

function WanGerdSection() {
  const days = Object.entries(WAN_GERD_DEITIES);
  const DAY_NAMES = ['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัส','ศุกร์','เสาร์'];
  return (
    <View style={Sec.wrap}>
      {days.map(([dayNum, deity]) => {
        const d = deity as any;
        return (
          <View key={dayNum} style={Sec.wanCard}>
            <View style={[Sec.wanCircle, {backgroundColor: `${d.color ?? Colors.gold.bright}22`,
              borderColor: d.color ?? Colors.gold.bright}]}>
              <Text style={Sec.wanDay}>{DAY_NAMES[Number(dayNum)] ?? ''}</Text>
            </View>
            <View style={Sec.wanInfo}>
              <Text style={[Sec.wanDeity, {color: d.color ?? Colors.gold.bright}]}>
                {d.deityNameThai ?? d.nameThai ?? ''}
              </Text>
              <Text style={Sec.wanGem}>💎 {d.gemstone ?? ''}</Text>
              <Text style={Sec.wanDir}>🧭 {d.luckyDirection ?? d.luckyDir ?? ''}</Text>
            </View>
            <View style={[Sec.wanSwatch, {backgroundColor: d.color ?? Colors.gold.bright}]} />
          </View>
        );
      })}
    </View>
  );
}

function YantraSection() {
  return (
    <View style={Sec.yantraWrap}>
      <Text style={Sec.yantraTitle}>ยันต์นวเคราะห์</Text>
      <Text style={Sec.yantraSub}>Nava Graha Yantra · ตารางมหาจักร</Text>
      <View style={Sec.yantraBox}>
        <NavaGrahaYantra size={width * 0.7} />
      </View>
      <Text style={Sec.yantraDesc}>
        ยันต์นวเคราะห์เป็นตารางมหาจักรที่แสดงถึงพลังของดาวทั้ง 9
        ดวงในโหราศาสตร์ไทย การบูชายันต์นี้ช่วยเสริมพลังดาวที่อ่อนแอ
        และลดทอนอิทธิพลของดาวที่ให้โทษ
      </Text>
    </View>
  );
}

const Sec = StyleSheet.create({
  wrap:       {paddingVertical: 8},
  card:       {flexDirection: 'row', alignItems: 'center', marginHorizontal: 16,
               marginVertical: 4, backgroundColor: Colors.bg.dark,
               borderRadius: 12, padding: 12, overflow: 'hidden'},
  symbolBox:  {width: 44, height: 44, borderRadius: 22, alignItems: 'center',
               justifyContent: 'center', borderWidth: 1, marginRight: 12},
  symbol:     {fontSize: 22},
  info:       {flex: 1},
  nameThai:   {fontSize: 13, color: Colors.text.primary, fontWeight: '600'},
  nameEn:     {fontSize: 9, color: Colors.text.muted, marginTop: 1},
  desc:       {fontSize: 10, color: Colors.text.secondary, marginTop: 4, lineHeight: 14},
  colorBar:   {width: 3, height: '100%', position: 'absolute', right: 0, borderRadius: 2},
  // Rasi grid
  grid:       {flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8, gap: 6, paddingVertical: 8},
  rasiCard:   {width: (width - 40) / 4, backgroundColor: Colors.bg.dark, borderRadius: 10,
               padding: 8, alignItems: 'center', borderWidth: 1,
               borderColor: 'rgba(212,160,23,0.1)'},
  rasiSym:    {fontSize: 20, marginBottom: 4},
  rasiThai:   {fontSize: 8, color: Colors.gold.warm, textAlign: 'center'},
  rasiEn:     {fontSize: 7, color: Colors.text.muted, textAlign: 'center'},
  rasiEl:     {fontSize: 7, color: Colors.celestial.sky, marginTop: 2},
  // Nakshatra table
  nakWrap:    {paddingHorizontal: 16, paddingVertical: 8},
  nakHeader:  {flexDirection: 'row', paddingVertical: 6, borderBottomWidth: 1,
               borderBottomColor: 'rgba(212,160,23,0.2)', marginBottom: 4},
  nakCol:     {fontSize: 8, color: Colors.gold.warm, letterSpacing: 0.5, fontWeight: '600'},
  nakRow:     {flexDirection: 'row', paddingVertical: 5},
  nakRowAlt:  {backgroundColor: 'rgba(212,160,23,0.04)', borderRadius: 4},
  nakCell:    {fontSize: 9, color: Colors.text.secondary},
  // Wan Gerd
  wanCard:    {flexDirection: 'row', alignItems: 'center', marginHorizontal: 16,
               marginVertical: 4, backgroundColor: Colors.bg.dark, borderRadius: 12,
               padding: 12, overflow: 'hidden'},
  wanCircle:  {width: 50, height: 50, borderRadius: 25, alignItems: 'center',
               justifyContent: 'center', borderWidth: 1, marginRight: 12},
  wanDay:     {fontSize: 9, color: Colors.text.primary, textAlign: 'center'},
  wanInfo:    {flex: 1, gap: 3},
  wanDeity:   {fontSize: 13, fontWeight: '600'},
  wanGem:     {fontSize: 9, color: Colors.text.muted},
  wanDir:     {fontSize: 9, color: Colors.text.muted},
  wanSwatch:  {width: 3, height: '100%', position: 'absolute', right: 0, borderRadius: 2},
  // Yantra
  yantraWrap: {alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16},
  yantraTitle:{fontSize: 16, color: Colors.gold.bright, fontWeight: '600', letterSpacing: 2},
  yantraSub:  {fontSize: 9, color: Colors.text.muted, marginTop: 4, marginBottom: 16},
  yantraBox:  {borderWidth: 1, borderColor: 'rgba(212,160,23,0.2)', borderRadius: 4,
               padding: 4, backgroundColor: '#080912'},
  yantraDesc: {fontSize: 11, color: Colors.text.secondary, textAlign: 'center',
               marginTop: 16, lineHeight: 18},
});

// ─── MAIN SCREEN ──────────────────────────────────────────────────

export default function AlmanacScreen() {
  const [activeTab, setActiveTab] = useState('graha');

  const renderContent = () => {
    switch (activeTab) {
      case 'graha':     return <GrahaSection />;
      case 'rasi':      return <RasiSection />;
      case 'nakshatra': return <NakshatraSection />;
      case 'wan':       return <WanGerdSection />;
      case 'yantra':    return <YantraSection />;
      default:          return null;
    }
  };

  return (
    <LinearGradient colors={['#0C0A18','#120E22','#0C0A18']} style={S.fill}>
      <SafeAreaView style={S.fill}>
        {/* Header */}
        <View style={S.header}>
          <Text style={S.title}>คัมภีร์โหราศาสตร์</Text>
          <Text style={S.subtitle}>ความรู้แห่งนวเคราะห์</Text>
        </View>

        {/* Tab bar */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={S.tabRow}
        >
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[S.tab, activeTab === tab.key && S.tabActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[S.tabText, activeTab === tab.key && S.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <GoldDivider />

        {/* Content */}
        <ScrollView showsVerticalScrollIndicator={false}>
          {renderContent()}
          <View style={{height: 40}} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const S = StyleSheet.create({
  fill:       {flex: 1},
  header:     {alignItems: 'center', paddingTop: 20, paddingBottom: 8},
  title:      {fontSize: 20, color: Colors.gold.bright, fontWeight: '600', letterSpacing: 2},
  subtitle:   {fontSize: 10, color: Colors.text.muted, marginTop: 4},
  tabRow:     {paddingHorizontal: 16, paddingVertical: 8, gap: 8},
  tab:        {paddingHorizontal: 16, paddingVertical: 7, borderRadius: 14,
               backgroundColor: Colors.bg.dark, borderWidth: 1,
               borderColor: 'rgba(212,160,23,0.15)'},
  tabActive:  {backgroundColor: 'rgba(212,160,23,0.15)', borderColor: Colors.gold.bright},
  tabText:    {fontSize: 11, color: Colors.text.muted},
  tabTextActive: {color: Colors.gold.bright, fontWeight: '600'},
});
