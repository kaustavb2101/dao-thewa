/**
 * ดาวเทวา — WatchFacePreview
 * SVG Apple Watch face preview with live orrery + hora + phase
 */
import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Svg, {Circle, Text as SvgText, G} from 'react-native-svg';
import {Colors} from '../theme/colors';
import {toThaiNumerals} from './ThaiNumeralText';
import type {DailyAstroData} from '../engines/AstronomicalEngine';

interface Props {
  astroData?: DailyAstroData | null;
  theme?: 'Siam' | 'Lotus' | 'Indigo' | 'Sacred';
  size?: number;
}

const THEMES = {
  Siam:   {bg: '#1a0a04', accent: '#D4A017', face: '#2D1200'},
  Lotus:  {bg: '#0D1B2A', accent: '#E8880A', face: '#162032'},
  Indigo: {bg: '#0A0B1E', accent: '#7E57C2', face: '#111230'},
  Sacred: {bg: '#0F0C01', accent: '#FFD700', face: '#1A1500'},
};

export function WatchFacePreview({
  astroData,
  theme = 'Siam',
  size = 200,
}: Props) {
  const t = THEMES[theme];
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.45;

  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

  const lunarEmoji =
    astroData && astroData.lunarPhase.phase > 0.47 && astroData.lunarPhase.phase < 0.53
      ? '🌕'
      : '🌙';

  return (
    <View style={[styles.container, {width: size, height: size}]}>
      <Svg width={size} height={size}>
        {/* Watch bezel */}
        <Circle cx={cx} cy={cy} r={r + 6} fill={t.accent} opacity={0.9} />
        {/* Watch face */}
        <Circle cx={cx} cy={cy} r={r} fill={t.face} />
        {/* Orbit ring */}
        <Circle
          cx={cx}
          cy={cy}
          r={r * 0.55}
          stroke={t.accent}
          strokeWidth={0.8}
          fill="none"
          opacity={0.25}
        />
        {/* Time */}
        <SvgText
          x={cx}
          y={cy - 4}
          textAnchor="middle"
          fill={t.accent}
          fontSize={size * 0.12}
          fontWeight="bold">
          {toThaiNumerals(timeStr)}
        </SvgText>
        {/* Hora label */}
        {astroData && (
          <SvgText
            x={cx}
            y={cy + size * 0.1}
            textAnchor="middle"
            fill={t.accent}
            fontSize={size * 0.055}
            opacity={0.7}>
            {astroData.currentHora.planetNameThai}
          </SvgText>
        )}
        {/* Lunar phase dot */}
        {astroData && (
          <SvgText
            x={cx}
            y={cy - size * 0.22}
            textAnchor="middle"
            fontSize={size * 0.08}>
            {lunarEmoji}
          </SvgText>
        )}
        {/* Thai date */}
        {astroData && (
          <SvgText
            x={cx}
            y={cy + size * 0.3}
            textAnchor="middle"
            fill={t.accent}
            fontSize={size * 0.05}
            opacity={0.5}>
            {toThaiNumerals(astroData.thaiDate.buddhistYear)}
          </SvgText>
        )}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
