/**
 * ดาวเทวา — CalendarScreen (ปฏิทินจักรราศี)
 * Thai zodiac wheel · Month strip · Upcoming auspicious/caution events
 */
import React, {useState, useRef} from 'react';
import {
  View, Text, StyleSheet, Dimensions, ScrollView,
  TouchableOpacity, Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {SafeAreaView} from 'react-native-safe-area-context';
import Svg, {
  Circle, Line, Text as SvgText, G, Path,
} from 'react-native-svg';
import {LotusLoader} from '../components/LotusLoader';
import {GoldDivider} from '../components/GoldDivider';
import {useDailyData} from '../hooks/useDailyData';
import {ThaiRulesEngine} from '../engines/ThaiRulesEngine';
import {Colors} from '../theme/colors';
import {THAI_RASI} from '../../config/constants';

const {width} = Dimensions.get('window');
const WHEEL_SIZE = width * 0.78;
const R = WHEEL_SIZE / 2;

// ─── ZODIAC WHEEL ─────────────────────────────────────────────────

const ZODIAC_COLORS = [
  '#E8A020', '#88C460', '#6EB8D4', '#E07848',
  '#7060D0', '#D48838', '#D04848', '#2890A0',
  '#60A870', '#7060D0', '#50A0C0', '#9860C0',
];

function ZodiacWheel({currentRasi}: {currentRasi: number}) {
  const cx = R;
  const cy = R;
  const outerR = R - 4;
  const innerR = R * 0.52;
  const labelR = R * 0.77;
  const segAngle = (2 * Math.PI) / 12;

  // offset so Aries (0) starts at top-left (like standard wheel)
  const startOffset = -Math.PI / 2;

  const slices = THAI_RASI.map((rasi, i) => {
    const a1 = startOffset + i * segAngle;
    const a2 = startOffset + (i + 1) * segAngle;
    const x1 = cx + outerR * Math.cos(a1);
    const y1 = cy + outerR * Math.sin(a1);
    const x2 = cx + outerR * Math.cos(a2);
    const y2 = cy + outerR * Math.sin(a2);
    const x3 = cx + innerR * Math.cos(a2);
    const y3 = cy + innerR * Math.sin(a2);
    const x4 = cx + innerR * Math.cos(a1);
    const y4 = cy + innerR * Math.sin(a1);
    const midA = startOffset + (i + 0.5) * segAngle;
    const lx = cx + labelR * Math.cos(midA);
    const ly = cy + labelR * Math.sin(midA);
    const isActive = i === currentRasi;
    const fill = isActive
      ? ZODIAC_COLORS[i]
      : `${ZODIAC_COLORS[i]}44`;
    const strokeC = isActive ? '#F5C842' : 'rgba(212,160,23,0.15)';
    return {
      path: `M${x1},${y1} A${outerR},${outerR},0,0,1,${x2},${y2} L${x3},${y3} A${innerR},${innerR},0,0,0,${x4},${y4} Z`,
      fill, strokeC, lx, ly, symbol: rasi.symbol, nameThai: rasi.nameThai, isActive,
    };
  });

  return (
    <Svg width={WHEEL_SIZE} height={WHEEL_SIZE}>
      {/* Outer ring glow */}
      <Circle cx={cx} cy={cy} r={outerR} fill="none" stroke="rgba(212,160,23,0.08)" strokeWidth={2} />
      {slices.map((s, i) => (
        <G key={i}>
          <Path d={s.path} fill={s.fill} stroke={s.strokeC} strokeWidth={s.isActive ? 1.5 : 0.5} />
          <SvgText
            x={s.lx} y={s.ly}
            textAnchor="middle" dominantBaseline="middle"
            fontSize={s.isActive ? 13 : 10}
            fill={s.isActive ? '#F5C842' : '#9A8060'}
            fontWeight={s.isActive ? '700' : '400'}
          >
            {s.symbol}
          </SvgText>
        </G>
      ))}
      {/* Center circle */}
      <Circle cx={cx} cy={cy} r={innerR} fill="#0A0B1E" stroke="rgba(212,160,23,0.2)" strokeWidth={1} />
      <SvgText
        x={cx} y={cy - 10}
        textAnchor="middle" dominantBaseline="middle"
        fontSize={22} fill="#F5C842"
      >
        {THAI_RASI[currentRasi]?.symbol ?? '☀'}
      </SvgText>
      <SvgText
        x={cx} y={cy + 14}
        textAnchor="middle" dominantBaseline="middle"
        fontSize={10} fill="#C8A854"
      >
        {THAI_RASI[currentRasi]?.nameThai ?? ''}
      </SvgText>
    </Svg>
  );
}

// ─── MONTH STRIP ──────────────────────────────────────────────────

const THAI_MONTHS = [
  'ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.',
  'ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.',
];

// ─── EVENT CARD ───────────────────────────────────────────────────

const EVENT_TYPE_COLORS: Record<string, string> = {
  auspicious:   Colors.success,
  caution:      Colors.danger,
  neutral:      Colors.gold.bright,
  opportunity:  Colors.celestial.sky,
};

interface UpcomingEvent {
  date: Date;
  titleThai: string;
  titleEn: string;
  type: string;
  planet: string;
}

function EventRow({event}: {event: UpcomingEvent}) {
  const color = EVENT_TYPE_COLORS[event.type] ?? Colors.gold.bright;
  const d = new Date(event.date);
  const day  = d.getDate();
  const mon  = THAI_MONTHS[d.getMonth()];
  return (
    <View style={[E.row, {borderLeftColor: color}]}>
      <View style={E.dateBox}>
        <Text style={[E.day, {color}]}>{day}</Text>
        <Text style={E.mon}>{mon}</Text>
      </View>
      <View style={E.textBox}>
        <Text style={E.title} numberOfLines={1}>{event.titleThai}</Text>
        <Text style={E.sub}>{event.planet}</Text>
      </View>
      <View style={[E.typePill, {backgroundColor: `${color}22`, borderColor: `${color}55`}]}>
        <Text style={[E.typeText, {color}]}>{event.type}</Text>
      </View>
    </View>
  );
}

const E = StyleSheet.create({
  row:      {flexDirection:'row',alignItems:'center',marginHorizontal:16,marginVertical:4,
             backgroundColor:Colors.bg.dark,borderRadius:10,padding:12,borderLeftWidth:3},
  dateBox:  {width:36,alignItems:'center',marginRight:12},
  day:      {fontSize:18,fontWeight:'700'},
  mon:      {fontSize:8,color:Colors.text.muted,letterSpacing:0.5},
  textBox:  {flex:1},
  title:    {fontSize:12,color:Colors.text.primary,fontWeight:'500'},
  sub:      {fontSize:9,color:Colors.text.muted,marginTop:2},
  typePill: {paddingHorizontal:8,paddingVertical:3,borderRadius:8,borderWidth:1},
  typeText: {fontSize:9,fontWeight:'600'},
});

// ─── MAIN SCREEN ──────────────────────────────────────────────────

export default function CalendarScreen() {
  const {data, isLoading} = useDailyData();
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());

  if (isLoading || !data) {
    return (
      <LinearGradient colors={['#060C18','#0A1428','#060C18']} style={S.fill}>
        <LotusLoader label="กำลังโหลดปฏิทิน..." />
      </LinearGradient>
    );
  }

  const sunRasi = data.planets?.find(p => p.planet === 'SURYA')?.rasi ?? 0;

  // Generate upcoming events
  const upcomingEvents: UpcomingEvent[] = (() => {
    try {
      const raw = ThaiRulesEngine.findUpcomingEvents(now, data.planets ?? [], 60);
      return raw.map(e => ({
        date: e.date,
        titleThai: e.titleThai ?? e.title ?? '',
        titleEn: e.titleEn ?? '',
        type: e.type ?? 'neutral',
        planet: e.planet ?? '',
      }));
    } catch {
      return [];
    }
  })();

  const monthEvents = upcomingEvents.filter(e => new Date(e.date).getMonth() === selectedMonth);

  return (
    <LinearGradient colors={['#060C18','#0A1428','#060C18']} style={S.fill}>
      <SafeAreaView style={S.fill}>
        <ScrollView showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={S.header}>
            <Text style={S.title}>ปฏิทินจักรราศี</Text>
            <Text style={S.sub}>จักรราศีสุริยะ · {THAI_RASI[sunRasi]?.nameThai ?? ''}</Text>
          </View>

          {/* Zodiac Wheel */}
          <View style={S.wheelWrap}>
            <ZodiacWheel currentRasi={sunRasi} />
          </View>

          {/* Rasi info pills */}
          <View style={S.rasiRow}>
            {[
              {label:'ราศี', value: THAI_RASI[sunRasi]?.nameThai ?? ''},
              {label:'ธาตุ', value: THAI_RASI[sunRasi]?.element ?? ''},
              {label:'เจ้าเรือน', value: THAI_RASI[sunRasi]?.ruler ?? ''},
            ].map((item, i) => (
              <View key={i} style={S.rasiCell}>
                <Text style={S.rasiLabel}>{item.label}</Text>
                <Text style={S.rasiValue}>{item.value}</Text>
              </View>
            ))}
          </View>

          <GoldDivider symbol="✦" />

          {/* Month strip */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={S.monthStrip}
          >
            {THAI_MONTHS.map((m, i) => {
              const hasEvents = upcomingEvents.some(e => new Date(e.date).getMonth() === i);
              const isSelected = i === selectedMonth;
              return (
                <TouchableOpacity
                  key={i}
                  style={[S.monthChip, isSelected && S.monthChipActive]}
                  onPress={() => setSelectedMonth(i)}
                >
                  <Text style={[S.monthText, isSelected && S.monthTextActive]}>{m}</Text>
                  {hasEvents && <View style={[S.dot, isSelected && S.dotActive]} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Events */}
          <Text style={S.secTitle}>
            {THAI_MONTHS[selectedMonth]} · {monthEvents.length > 0 ? `${monthEvents.length} เหตุการณ์` : 'ไม่มีเหตุการณ์'}
          </Text>

          {monthEvents.length > 0 ? (
            monthEvents.map((ev, i) => (
              <EventRow key={i} event={ev} />
            ))
          ) : upcomingEvents.length > 0 ? (
            // Show next events regardless of month
            <View style={S.emptyBox}>
              <Text style={S.emptyText}>ไม่มีเหตุการณ์ในเดือนนี้</Text>
              <Text style={S.emptyHint}>เลือกเดือนอื่นเพื่อดูเหตุการณ์</Text>
            </View>
          ) : (
            <View style={S.emptyBox}>
              <Text style={S.emptyText}>วันสงบ — ท้องฟ้าแจ่มใส</Text>
            </View>
          )}

          {/* Upcoming events (next 30 days) */}
          {upcomingEvents.length > 0 && (
            <>
              <GoldDivider symbol="⟡" />
              <Text style={S.secTitle}>เหตุการณ์สำคัญข้างหน้า</Text>
              {upcomingEvents.slice(0, 8).map((ev, i) => (
                <EventRow key={`all_${i}`} event={ev} />
              ))}
            </>
          )}

          <View style={{height: 40}} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const S = StyleSheet.create({
  fill:           {flex: 1},
  header:         {alignItems: 'center', paddingTop: 20, paddingBottom: 8},
  title:          {fontSize: 20, color: Colors.gold.bright, fontWeight: '600', letterSpacing: 2},
  sub:            {fontSize: 10, color: Colors.text.muted, marginTop: 4},
  wheelWrap:      {alignItems: 'center', paddingVertical: 8},
  rasiRow:        {flexDirection: 'row', marginHorizontal: 24, marginBottom: 8,
                   backgroundColor: Colors.bg.dark, borderRadius: 12, paddingVertical: 12},
  rasiCell:       {flex: 1, alignItems: 'center'},
  rasiLabel:      {fontSize: 8, color: Colors.text.muted, letterSpacing: 1, marginBottom: 4},
  rasiValue:      {fontSize: 12, color: Colors.text.primary, fontWeight: '500'},
  monthStrip:     {paddingHorizontal: 16, paddingVertical: 8, gap: 6},
  monthChip:      {paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14,
                   backgroundColor: Colors.bg.dark, borderWidth: 1,
                   borderColor: 'rgba(212,160,23,0.15)', alignItems: 'center'},
  monthChipActive:{backgroundColor: 'rgba(212,160,23,0.15)',
                   borderColor: Colors.gold.bright},
  monthText:      {fontSize: 10, color: Colors.text.muted},
  monthTextActive:{color: Colors.gold.bright, fontWeight: '600'},
  dot:            {width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.text.muted, marginTop: 3},
  dotActive:      {backgroundColor: Colors.gold.bright},
  secTitle:       {fontSize: 10, color: Colors.text.muted, letterSpacing: 1,
                   marginHorizontal: 16, marginVertical: 8},
  emptyBox:       {padding: 32, alignItems: 'center'},
  emptyText:      {fontSize: 13, color: Colors.text.muted, textAlign: 'center'},
  emptyHint:      {fontSize: 10, color: Colors.text.muted, marginTop: 4, opacity: 0.6},
});
