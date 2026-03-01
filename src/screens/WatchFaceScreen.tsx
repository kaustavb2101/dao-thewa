/**
 * ดาวเทวา — WatchFaceScreen (นาฬิกาข้อมือ)
 * Live watch face preview · 4 Thai-themed designs
 * react-native-watch-connectivity export · Wear OS bridge
 */
import React, {useState, useEffect} from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {SafeAreaView} from 'react-native-safe-area-context';
import {WatchFacePreview} from '../components/WatchFacePreview';
import {GoldDivider} from '../components/GoldDivider';
import {toThaiNumerals} from '../components/ThaiNumeralText';
import {useDailyData} from '../hooks/useDailyData';
import {Colors} from '../theme/colors';
import {THAI_RASI, NAVA_GRAHA} from '../../config/constants';

const {width} = Dimensions.get('window');

// ─── THEME DEFINITIONS ────────────────────────────────────────────

export type WatchTheme = 'siam' | 'lotus' | 'indigo' | 'sacred';

const THEMES: {key: WatchTheme; label: string; desc: string; colors: string[]}[] = [
  {
    key:    'siam',
    label:  'สยาม',
    desc:   'ทองคลาสสิก · สีเดิมแท้',
    colors: ['#1A1200', '#2A1E00', '#F5C842'],
  },
  {
    key:    'lotus',
    label:  'บัวหลวง',
    desc:   'ชมพูมอสคาว · ดอกบัว',
    colors: ['#1A0018', '#2A001E', '#E090C0'],
  },
  {
    key:    'indigo',
    label:  'คราม',
    desc:   'น้ำเงินล้ำลึก · จักรวาล',
    colors: ['#040C1E', '#081428', '#5090F0'],
  },
  {
    key:    'sacred',
    label:  'ศักดิ์สิทธิ์',
    desc:   'ขาวบริสุทธิ์ · แสงพระ',
    colors: ['#0C1010', '#141818', '#D0E8E0'],
  },
];

// ─── COMPLICATION CARD ────────────────────────────────────────────

interface ComplicationItem {
  id: string;
  label: string;
  value: string;
  icon: string;
}

function ComplicationCard({item}: {item: ComplicationItem}) {
  return (
    <View style={C.card}>
      <Text style={C.icon}>{item.icon}</Text>
      <Text style={C.value}>{item.value}</Text>
      <Text style={C.label}>{item.label}</Text>
    </View>
  );
}

const C = StyleSheet.create({
  card:  {alignItems: 'center', width: (width - 64) / 4, backgroundColor: Colors.bg.dark,
          borderRadius: 10, padding: 10, borderWidth: 1, borderColor: 'rgba(212,160,23,0.1)'},
  icon:  {fontSize: 18, marginBottom: 4},
  value: {fontSize: 11, color: Colors.gold.bright, fontWeight: '600'},
  label: {fontSize: 7, color: Colors.text.muted, marginTop: 2, textAlign: 'center'},
});

// ─── SEND TO WATCH ────────────────────────────────────────────────

async function sendToWatch(theme: WatchTheme, data: any) {
  // react-native-watch-connectivity (Apple Watch)
  try {
    const WatchConnectivity = require('react-native-watch-connectivity');
    if (await WatchConnectivity.default.getReachability()) {
      await WatchConnectivity.default.sendMessage({
        type:        'UPDATE_WATCH_FACE',
        theme,
        horaName:    data?.currentHora?.planetNameThai ?? '',
        moonPhase:   data?.lunarPhase?.phaseNameThai ?? '',
        sunRasi:     THAI_RASI[data?.planets?.find((p: any) => p.planet === 'SURYA')?.rasi ?? 0]?.nameThai ?? '',
      });
      return true;
    }
  } catch {/* watch not paired */}
  return false;
}

// ─── MAIN SCREEN ──────────────────────────────────────────────────

export default function WatchFaceScreen() {
  const {data} = useDailyData();
  const [theme, setTheme] = useState<WatchTheme>('siam');
  const [now, setNow] = useState(new Date());
  const [sentToWatch, setSentToWatch] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const sunRasi  = data?.planets?.find(p => p.planet === 'SURYA')?.rasi ?? 0;
  const moonRasi = data?.planets?.find(p => p.planet === 'CHANDRA')?.rasi ?? 0;

  const complications: ComplicationItem[] = [
    {
      id:    'hora',
      icon:  data?.currentHora?.symbol ?? '☉',
      label: 'ฤกษ์',
      value: data?.currentHora?.planetNameThai ?? '—',
    },
    {
      id:    'moon',
      icon:  '🌙',
      label: 'ดวงจันทร์',
      value: data?.lunarPhase?.phaseNameThai ?? '—',
    },
    {
      id:    'sun',
      icon:  '☀',
      label: 'สุริยะ',
      value: THAI_RASI[sunRasi]?.nameThai ?? '—',
    },
    {
      id:    'energy',
      icon:  '✦',
      label: 'พลัง',
      value: data?.currentHora?.meaningThai?.slice(0,6) ?? '—',
    },
  ];

  const handleSendToWatch = async () => {
    const success = await sendToWatch(theme, data);
    setSentToWatch(success);
    setTimeout(() => setSentToWatch(false), 3000);
  };

  const selectedTheme = THEMES.find(t => t.key === theme) ?? THEMES[0];

  return (
    <LinearGradient colors={['#0A0A14','#0F0F1E','#0A0A14']} style={S.fill}>
      <SafeAreaView style={S.fill}>
        <ScrollView showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={S.header}>
            <Text style={S.title}>นาฬิกาข้อมือ</Text>
            <Text style={S.sub}>
              {Platform.OS === 'ios' ? 'Apple Watch' : 'Wear OS'} · ดาวเทวา
            </Text>
          </View>

          {/* Watch Face Preview */}
          <View style={S.previewWrap}>
            <WatchFacePreview
              theme={theme}
              time={now}
              horaName={data?.currentHora?.planetNameThai ?? ''}
              moonPhase={data?.lunarPhase?.phaseNameThai ?? ''}
              sunRasiName={THAI_RASI[sunRasi]?.nameThai ?? ''}
              moonRasiName={THAI_RASI[moonRasi]?.nameThai ?? ''}
            />
          </View>

          {/* Theme selector */}
          <View style={S.themeRow}>
            {THEMES.map(t => (
              <TouchableOpacity
                key={t.key}
                style={[S.themeChip, theme === t.key && S.themeChipActive,
                  theme === t.key && {borderColor: t.colors[2]}]}
                onPress={() => setTheme(t.key)}
              >
                <View style={[S.themeColor, {backgroundColor: t.colors[2]}]} />
                <Text style={[S.themeLabel, theme === t.key && {color: t.colors[2]}]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={S.themeDesc}>{selectedTheme.desc}</Text>

          <GoldDivider symbol="⌚" />

          {/* Complications grid */}
          <Text style={S.secTitle}>ข้อมูลบนหน้าปัด</Text>
          <View style={S.compRow}>
            {complications.map(c => (
              <ComplicationCard key={c.id} item={c} />
            ))}
          </View>

          <GoldDivider />

          {/* Planet positions */}
          {data?.planets && (
            <>
              <Text style={S.secTitle}>ตำแหน่งดาว</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={S.planetStrip}
              >
                {data.planets.map((p, i) => {
                  const graha = NAVA_GRAHA[p.planet as keyof typeof NAVA_GRAHA];
                  return (
                    <View key={i} style={[S.planetPill, {borderColor: `${graha?.color ?? Colors.gold.bright}44`}]}>
                      <Text style={[S.planetSym, {color: graha?.color ?? Colors.gold.bright}]}>
                        {p.symbol ?? graha?.symbol ?? '•'}
                      </Text>
                      <Text style={S.planetRasi}>{THAI_RASI[p.rasi]?.nameThai ?? ''}</Text>
                      {p.isRetrograde && <Text style={S.retroTag}>℞</Text>}
                    </View>
                  );
                })}
              </ScrollView>
            </>
          )}

          {/* Send to Watch button */}
          <View style={S.sendWrap}>
            <TouchableOpacity style={S.sendBtn} onPress={handleSendToWatch}>
              <Text style={S.sendIcon}>⌚</Text>
              <Text style={S.sendText}>
                {sentToWatch ? 'ส่งแล้ว ✓' : 'ส่งไปนาฬิกา'}
              </Text>
            </TouchableOpacity>
            <Text style={S.sendHint}>
              {Platform.OS === 'ios'
                ? 'ต้องการ Apple Watch + แอป Dao Thewa Watch'
                : 'ต้องการ Wear OS + แอป Dao Thewa Watch'}
            </Text>
          </View>

          <View style={{height: 40}} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const S = StyleSheet.create({
  fill:        {flex: 1},
  header:      {alignItems: 'center', paddingTop: 20, paddingBottom: 8},
  title:       {fontSize: 20, color: Colors.gold.bright, fontWeight: '600', letterSpacing: 2},
  sub:         {fontSize: 10, color: Colors.text.muted, marginTop: 4},
  previewWrap: {alignItems: 'center', paddingVertical: 16},
  themeRow:    {flexDirection: 'row', justifyContent: 'center', gap: 8,
                paddingHorizontal: 16, marginTop: 8},
  themeChip:   {flexDirection: 'row', alignItems: 'center', gap: 6,
                paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16,
                backgroundColor: Colors.bg.dark, borderWidth: 1,
                borderColor: 'rgba(212,160,23,0.15)'},
  themeChipActive: {backgroundColor: 'rgba(212,160,23,0.08)'},
  themeColor:  {width: 10, height: 10, borderRadius: 5},
  themeLabel:  {fontSize: 10, color: Colors.text.muted},
  themeDesc:   {fontSize: 9, color: Colors.text.muted, textAlign: 'center', marginTop: 6},
  secTitle:    {fontSize: 9, color: Colors.text.muted, letterSpacing: 1,
                marginHorizontal: 16, marginVertical: 8},
  compRow:     {flexDirection: 'row', justifyContent: 'center', gap: 6,
                paddingHorizontal: 16, marginBottom: 8},
  planetStrip: {paddingHorizontal: 16, paddingVertical: 4, gap: 8},
  planetPill:  {alignItems: 'center', backgroundColor: Colors.bg.dark, borderRadius: 10,
                paddingHorizontal: 10, paddingVertical: 8, borderWidth: 1, minWidth: 56},
  planetSym:   {fontSize: 16},
  planetRasi:  {fontSize: 8, color: Colors.text.muted, marginTop: 4, textAlign: 'center'},
  retroTag:    {fontSize: 7, color: Colors.danger, marginTop: 2},
  sendWrap:    {alignItems: 'center', paddingHorizontal: 32, paddingTop: 16},
  sendBtn:     {flexDirection: 'row', alignItems: 'center', gap: 8,
                backgroundColor: 'rgba(212,160,23,0.12)', borderRadius: 24,
                paddingHorizontal: 28, paddingVertical: 14,
                borderWidth: 1, borderColor: 'rgba(212,160,23,0.4)'},
  sendIcon:    {fontSize: 18},
  sendText:    {fontSize: 14, color: Colors.gold.bright, fontWeight: '600', letterSpacing: 1},
  sendHint:    {fontSize: 9, color: Colors.text.muted, marginTop: 8, textAlign: 'center'},
});
