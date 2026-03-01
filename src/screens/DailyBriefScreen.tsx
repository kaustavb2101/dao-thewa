/**
 * ดาวเทวา — DailyBriefScreen (ดวงชะตา)
 * AI-generated daily reading · Transit cards · Planet filter chips
 */
import React, {useState} from 'react';
import {View, Text, ScrollView, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDailyData} from '../hooks/useDailyData';
import {TransitCard} from '../components/TransitCard';
import {PlanetChip} from '../components/PlanetChip';
import {GoldDivider} from '../components/GoldDivider';
import {IntensityBar} from '../components/IntensityBar';
import {LotusLoader} from '../components/LotusLoader';
import {ThaiRulesEngine} from '../engines/ThaiRulesEngine';
import {Colors} from '../theme/colors';
import {NAVA_GRAHA} from '../../config/constants';
import type {RuleCategory} from '../engines/ThaiRulesEngine';

const GRAHA_KEYS = Object.keys(NAVA_GRAHA) as (keyof typeof NAVA_GRAHA)[];

const QUALITY_COLORS: Record<string, string> = {
  'very auspicious': Colors.success,
  'auspicious':      Colors.gold.bright,
  'neutral':         Colors.celestial.sky,
  'challenging':     Colors.warning,
  'very challenging':Colors.danger,
};

export default function DailyBriefScreen() {
  const {data, isLoading} = useDailyData();
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);

  if (isLoading || !data) {
    return (
      <LinearGradient colors={['#0A0B1E','#111230','#0A0B1E']} style={S.fill}>
        <LotusLoader label="กำลังทำนาย..." />
      </LinearGradient>
    );
  }

  // Build interpretation from rules engine
  const interpretation = (() => {
    try {
      return ThaiRulesEngine.interpret({
        planets:          data.planets ?? [],
        transits:         data.natalTransits ?? [],
        lunarPhase:       data.lunarPhase,
        currentHora:      data.currentHora,
        thaiDate:         data.thaiDate,
        wanGerd:          data.thaiDate.wan,
        birthRasi:        data.planets?.find(p => p.planet === 'SURYA')?.rasi ?? 0,
        birthNakshatra:   data.planets?.find(p => p.planet === 'CHANDRA')?.nakshatra ?? 0,
      });
    } catch {
      return null;
    }
  })();

  const qualityColor = interpretation
    ? QUALITY_COLORS[interpretation.overallQuality] ?? Colors.gold.bright
    : Colors.gold.bright;

  const filteredRules = interpretation?.activeRules.filter(rule => {
    if (!selectedPlanet) return true;
    const lower = selectedPlanet.toLowerCase();
    return (
      rule.id.toLowerCase().includes(lower) ||
      rule.titleThai.includes(NAVA_GRAHA[selectedPlanet as keyof typeof NAVA_GRAHA]?.nameThai ?? '')
    );
  }) ?? [];

  return (
    <LinearGradient colors={['#0A0B1E','#111230','#0A0B1E']} style={S.fill}>
      <SafeAreaView style={S.fill}>
        <ScrollView showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={S.header}>
            <Text style={S.screenTitle}>ดวงชะตา</Text>
            <Text style={S.dateLabel}>
              {data.thaiDate.wanNameThai} · {data.thaiDate.thaiMonth} {data.thaiDate.buddhistYear + 543 - 543}
            </Text>
          </View>

          {/* Overall quality badge */}
          {interpretation && (
            <View style={[S.qualityBadge, {borderColor: qualityColor}]}>
              <Text style={[S.qualityText, {color: qualityColor}]}>
                {interpretation.overallQualityThai}
              </Text>
              <IntensityBar intensity={interpretation.overallEnergy} color={qualityColor} />
            </View>
          )}

          {/* Headline */}
          {interpretation && (
            <View style={S.headlineBox}>
              <Text style={S.headline}>{interpretation.headline}</Text>
            </View>
          )}

          <GoldDivider />

          {/* Wan Gerd + Hora + Lunar strip */}
          {interpretation && (
            <View style={S.infoStrip}>
              <View style={S.infoCell}>
                <Text style={S.infoLabel}>วันเกิด</Text>
                <Text style={S.infoValue}>{interpretation.wanGerdMessage.split(' ')[0]}</Text>
              </View>
              <View style={S.infoDivider} />
              <View style={S.infoCell}>
                <Text style={S.infoLabel}>ฤกษ์</Text>
                <Text style={S.infoValue}>{data.currentHora.planetNameThai}</Text>
              </View>
              <View style={S.infoDivider} />
              <View style={S.infoCell}>
                <Text style={S.infoLabel}>จันทร์</Text>
                <Text style={S.infoValue}>{data.lunarPhase.phaseNameThai}</Text>
              </View>
            </View>
          )}

          {/* Lucky details */}
          {interpretation?.luckyDetails && (
            <View style={S.luckyBox}>
              <Text style={S.luckyTitle}>สิ่งมงคลวันนี้</Text>
              <View style={S.luckyRow}>
                {interpretation.luckyDetails.colors.slice(0,4).map((c,i) => (
                  <View key={i} style={[S.colorSwatch, {backgroundColor: c}]} />
                ))}
                {interpretation.luckyDetails.numbers.slice(0,4).map((n,i) => (
                  <View key={`n${i}`} style={S.numBadge}>
                    <Text style={S.numText}>{n}</Text>
                  </View>
                ))}
                {interpretation.luckyDetails.directions.slice(0,2).map((d,i) => (
                  <View key={`d${i}`} style={S.dirBadge}>
                    <Text style={S.dirText}>{d}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <GoldDivider symbol="♃" />

          {/* Planet filter chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={S.chipRow}>
            <PlanetChip
              grahaKey="SURYA"
              selected={selectedPlanet === null}
              onPress={() => setSelectedPlanet(null)}
            />
            {GRAHA_KEYS.slice(0,7).map(k => (
              <PlanetChip
                key={k}
                grahaKey={k}
                selected={selectedPlanet === k}
                onPress={() => setSelectedPlanet(selectedPlanet === k ? null : k)}
              />
            ))}
          </ScrollView>

          {/* Transit cards */}
          <View style={S.cards}>
            {filteredRules.length > 0 ? (
              filteredRules.map(rule => (
                <TransitCard key={rule.id} rule={rule} />
              ))
            ) : (
              <View style={S.emptyState}>
                <Text style={S.emptyText}>วันสงบ — ไม่มีอิทธิพลพิเศษ</Text>
              </View>
            )}
          </View>

          {/* Avoidances */}
          {interpretation?.avoidances && interpretation.avoidances.length > 0 && (
            <View style={S.avoidBox}>
              <Text style={S.avoidTitle}>⚠ สิ่งที่ควรหลีกเลี่ยง</Text>
              {interpretation.avoidances.map((a,i) => (
                <Text key={i} style={S.avoidText}>• {a}</Text>
              ))}
            </View>
          )}

          <View style={{height:40}} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const S = StyleSheet.create({
  fill:         {flex:1},
  header:       {alignItems:'center',paddingTop:20,paddingBottom:8},
  screenTitle:  {fontSize:22,color:Colors.gold.bright,fontWeight:'600',letterSpacing:2},
  dateLabel:    {fontSize:11,color:Colors.text.muted,marginTop:4},
  qualityBadge: {flexDirection:'row',alignItems:'center',justifyContent:'center',gap:12,marginVertical:12,marginHorizontal:40,borderWidth:1,borderRadius:24,paddingVertical:10,paddingHorizontal:20},
  qualityText:  {fontSize:14,fontWeight:'600'},
  headlineBox:  {paddingHorizontal:24,paddingVertical:8},
  headline:     {fontSize:16,color:Colors.text.primary,textAlign:'center',lineHeight:24,fontWeight:'500'},
  infoStrip:    {flexDirection:'row',marginHorizontal:16,backgroundColor:Colors.bg.dark,borderRadius:12,paddingVertical:14,marginVertical:4},
  infoCell:     {flex:1,alignItems:'center'},
  infoDivider:  {width:1,backgroundColor:Colors.bg.subtle},
  infoLabel:    {fontSize:9,color:Colors.text.muted,marginBottom:4,letterSpacing:1},
  infoValue:    {fontSize:11,color:Colors.text.primary,textAlign:'center'},
  luckyBox:     {marginHorizontal:16,backgroundColor:Colors.bg.dark,borderRadius:12,padding:14,marginVertical:4},
  luckyTitle:   {fontSize:10,color:Colors.gold.warm,letterSpacing:1,marginBottom:8},
  luckyRow:     {flexDirection:'row',flexWrap:'wrap',gap:8,alignItems:'center'},
  colorSwatch:  {width:18,height:18,borderRadius:9},
  numBadge:     {width:24,height:24,borderRadius:12,backgroundColor:Colors.bg.subtle,alignItems:'center',justifyContent:'center'},
  numText:      {fontSize:11,color:Colors.gold.bright,fontWeight:'700'},
  dirBadge:     {paddingHorizontal:8,paddingVertical:4,backgroundColor:Colors.bg.subtle,borderRadius:8},
  dirText:      {fontSize:10,color:Colors.celestial.sky},
  chipRow:      {paddingHorizontal:16,paddingVertical:8,gap:8},
  cards:        {paddingBottom:8},
  emptyState:   {padding:32,alignItems:'center'},
  emptyText:    {fontSize:13,color:Colors.text.muted,textAlign:'center'},
  avoidBox:     {margin:16,backgroundColor:'rgba(244,67,54,0.08)',borderRadius:12,padding:14,borderWidth:1,borderColor:'rgba(244,67,54,0.2)'},
  avoidTitle:   {fontSize:11,color:Colors.danger,fontWeight:'600',marginBottom:8},
  avoidText:    {fontSize:11,color:Colors.text.secondary,marginBottom:4,lineHeight:18},
});
