/**
 * ดาวเทวา — ClockScreen (นาฬิกาจักรวาล)
 * Live orrery · Thai time in Thai numerals · Hora bar
 */
import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, Dimensions, ScrollView} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {SafeAreaView} from 'react-native-safe-area-context';
import {OrreryView} from '../components/OrreryView';
import {toThaiNumerals} from '../components/ThaiNumeralText';
import {LotusLoader} from '../components/LotusLoader';
import {GoldDivider} from '../components/GoldDivider';
import {useDailyData} from '../hooks/useDailyData';
import {Colors} from '../theme/colors';
import {THAI_RASI} from '../../config/constants';

const {width} = Dimensions.get('window');
const ORRERY_SIZE = width * 0.72;

const PHASE_EMOJI = (phase: number) => {
  if (phase < 0.04 || phase > 0.96) return '🌑';
  if (phase < 0.25) return '🌒';
  if (phase < 0.27) return '🌓';
  if (phase < 0.5)  return '🌔';
  if (phase < 0.53) return '🌕';
  if (phase < 0.75) return '🌖';
  if (phase < 0.77) return '🌗';
  return '🌘';
};

export default function ClockScreen() {
  const {data, isLoading} = useDailyData();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const fmt = (d: Date) => {
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    const s = String(d.getSeconds()).padStart(2, '0');
    return `${toThaiNumerals(h)}:${toThaiNumerals(m)}:${toThaiNumerals(s)}`;
  };
  const fmtShort = (d: Date) => {
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    return `${toThaiNumerals(h)}:${toThaiNumerals(m)}`;
  };

  if (isLoading) {
    return (
      <LinearGradient colors={['#2D0C08','#0F0401','#060200']} style={S.fill}>
        <LotusLoader label="กำลังคำนวณดาว..." />
      </LinearGradient>
    );
  }

  const lunar    = data?.lunarPhase;
  const hora     = data?.currentHora;
  const thaiDate = data?.thaiDate;
  const sunRasi  = data?.planets?.find(p => p.planet === 'SURYA')?.rasi ?? 0;

  return (
    <LinearGradient colors={['#2D0C08','#0F0401','#060200']} style={S.fill}>
      <SafeAreaView style={S.fill}>
        <ScrollView contentContainerStyle={S.scroll} showsVerticalScrollIndicator={false}>

          {lunar && (
            <View style={S.moonCorner}>
              <Text style={S.moonEmoji}>{PHASE_EMOJI(lunar.phase)}</Text>
              <Text style={S.moonName}>{lunar.phaseNameThai}</Text>
              <Text style={S.moonPct}>{toThaiNumerals(lunar.illumination)}%</Text>
            </View>
          )}

          <View style={S.orreryWrap}>
            <OrreryView size={ORRERY_SIZE} showOrbits />
          </View>

          <Text style={S.timeThai}>{fmt(now)}</Text>

          {thaiDate && (
            <View style={S.dateRow}>
              <Text style={S.chip}>{thaiDate.wanNameThai}</Text>
              <Text style={S.chip}>
                {toThaiNumerals(thaiDate.thaiDay)} {thaiDate.thaiMonth} {toThaiNumerals(thaiDate.buddhistYear)}
              </Text>
              <Text style={S.chip}>{THAI_RASI[sunRasi]?.nameThai ?? ''}</Text>
            </View>
          )}

          <GoldDivider />

          {hora && data?.horaHours && (
            <View style={S.horaBox}>
              <View style={S.horaHead}>
                <Text style={S.horaTitle}>ฤกษ์ {hora.planetNameThai}</Text>
                <Text style={S.horaEnd}>สิ้นสุด {fmtShort(new Date(hora.endTime))}</Text>
              </View>
              <View style={S.pills}>
                {data.horaHours.slice(0,12).map((h,i) => {
                  const ci = data.horaHours.findIndex(x => x.isCurrent);
                  return (
                    <View key={i} style={[S.pill, h.isCurrent && S.pillActive, i < ci && S.pillPast]} />
                  );
                })}
              </View>
              <Text style={S.horaMeaning}>{hora.meaningThai}</Text>
            </View>
          )}

          {data?.planets && (
            <>
              <GoldDivider symbol="⊕" />
              <Text style={S.secTitle}>นวเคราะห์</Text>
              <View style={S.planetGrid}>
                {data.planets.map((p,i) => (
                  <View key={i} style={S.planetCell}>
                    <Text style={S.planetSym}>{p.symbol}</Text>
                    <Text style={S.planetName}>{p.nameThai}</Text>
                    <Text style={S.planetRasi}>{THAI_RASI[p.rasi]?.nameThai ?? '—'}</Text>
                    {p.isRetrograde && <Text style={S.retro}>℞</Text>}
                  </View>
                ))}
              </View>
            </>
          )}
          <View style={{height:40}} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const S = StyleSheet.create({
  fill:       {flex:1},
  scroll:     {alignItems:'center', paddingTop:16},
  moonCorner: {position:'absolute',top:16,right:20,alignItems:'center',zIndex:10},
  moonEmoji:  {fontSize:22},
  moonName:   {fontSize:8,color:'#7A6045',marginTop:2},
  moonPct:    {fontSize:8,color:'#7A6045'},
  orreryWrap: {marginTop:32,marginBottom:8},
  timeThai:   {fontSize:52,color:Colors.gold.bright,letterSpacing:3,fontWeight:'200',textShadowColor:'rgba(245,200,66,0.4)',textShadowRadius:16},
  dateRow:    {flexDirection:'row',gap:6,marginTop:8,flexWrap:'wrap',justifyContent:'center'},
  chip:       {fontSize:9,color:'#C8B89A',borderWidth:1,borderColor:'rgba(212,160,23,0.25)',paddingHorizontal:8,paddingVertical:3,borderRadius:4},
  horaBox:    {width:'100%',paddingHorizontal:20},
  horaHead:   {flexDirection:'row',justifyContent:'space-between',marginBottom:8},
  horaTitle:  {fontSize:11,color:Colors.gold.warm,letterSpacing:1},
  horaEnd:    {fontSize:10,color:Colors.text.muted},
  pills:      {flexDirection:'row',gap:3},
  pill:       {flex:1,height:4,borderRadius:2,backgroundColor:'rgba(212,160,23,0.1)'},
  pillActive: {backgroundColor:Colors.gold.bright},
  pillPast:   {backgroundColor:'rgba(212,160,23,0.3)'},
  horaMeaning:{fontSize:10,color:Colors.text.secondary,marginTop:6,textAlign:'center'},
  secTitle:   {fontSize:10,color:'#7A6045',letterSpacing:2,marginBottom:12},
  planetGrid: {flexDirection:'row',flexWrap:'wrap',justifyContent:'center',gap:8,paddingHorizontal:16},
  planetCell: {alignItems:'center',width:72,backgroundColor:Colors.bg.dark,borderRadius:10,padding:10,borderWidth:1,borderColor:'rgba(212,160,23,0.1)'},
  planetSym:  {fontSize:18,marginBottom:4},
  planetName: {fontSize:9,color:Colors.text.secondary,marginBottom:2},
  planetRasi: {fontSize:8,color:Colors.text.muted,textAlign:'center'},
  retro:      {fontSize:8,color:Colors.danger,marginTop:2},
});
